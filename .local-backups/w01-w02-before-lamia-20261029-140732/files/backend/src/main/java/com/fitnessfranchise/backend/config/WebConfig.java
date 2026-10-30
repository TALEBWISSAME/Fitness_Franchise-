package com.fitnessfranchise.backend.config;

import com.fitnessfranchise.backend.auth.AccountService;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.*;
import org.springframework.web.servlet.config.annotation.*;
import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
    @Bean UserDetailsService userDetailsService(ObjectProvider<AccountService> accounts) {
        return email -> {
            AccountService service = accounts.getIfAvailable();
            if (service == null) throw new UsernameNotFoundException("Invalid credentials");
            return service.loadUserByUsername(email);
        };
    }
    @Bean SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        var cors = new UrlBasedCorsConfigurationSource();
        var configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST"));
        configuration.setAllowedHeaders(List.of("Content-Type", "X-CSRF-TOKEN"));
        configuration.setAllowCredentials(true);
        cors.registerCorsConfiguration("/api/**", configuration);
        http.cors(c -> c.configurationSource(cors))
            .authorizeHttpRequests(a -> a
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/activities").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/activities").authenticated()
                .requestMatchers("/api/health", "/api/auth/csrf", "/api/auth/register", "/api/auth/login").permitAll()
                .anyRequest().authenticated())
            .requestCache(c -> c.disable())
            .exceptionHandling(e -> e
                .authenticationEntryPoint((req, res, ex) -> {
                    res.setStatus(401); res.setContentType("application/json");
                    res.getWriter().write("{\"error\":\"UNAUTHENTICATED\"}");
                })
                .accessDeniedHandler((req, res, ex) -> {
                    res.setStatus(403); res.setContentType("application/json");
                    res.getWriter().write("{\"error\":\"FORBIDDEN\"}");
                }))
            .formLogin(f -> f.loginProcessingUrl("/api/auth/login").usernameParameter("email")
                .successHandler((req, res, auth) -> {
                    res.setContentType("application/json"); res.getWriter().write("{\"status\":\"AUTHENTICATED\"}");
                })
                .failureHandler((req, res, ex) -> {
                    res.setStatus(401); res.setContentType("application/json");
                    res.getWriter().write("{\"error\":\"INVALID_CREDENTIALS\"}");
                }))
            .logout(l -> l.logoutUrl("/api/auth/logout").invalidateHttpSession(true)
                .deleteCookies("JSESSIONID").logoutSuccessHandler((req, res, auth) -> res.setStatus(204)));
        return http.build();
    }
    @Override public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/activities").allowedOrigins("http://localhost:5173").allowedMethods("GET", "POST").allowCredentials(true);
        registry.addMapping("/api/**").allowedOrigins("http://localhost:5173").allowedMethods("GET", "POST").allowCredentials(true);
    }
}
