package com.fitnessfranchise.backend.equipment;

import com.fitnessfranchise.backend.config.WebConfig;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EquipmentController.class)
@Import(WebConfig.class)
class EquipmentControllerTest {
    @Autowired MockMvc mvc;
    @MockitoBean EquipmentService equipmentService;

    @Test
    void requiresAnAuthenticatedSession() throws Exception {
        mvc.perform(get("/api/equipments"))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(equipmentService);
    }

    @Test
    void returnsEquipmentUsingThePublicResponseFields() throws Exception {
        when(equipmentService.findAll()).thenReturn(List.of(
                new EquipmentResponse(12L, "Tapis de course", "TREADMILL", "cardio"),
                new EquipmentResponse(13L, "Presse à cuisses", "LEG_PRESS", "lower-body")));

        mvc.perform(get("/api/equipments")
                        .with(user("member@example.test"))
                        .header("Origin", "http://localhost:5173"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(12))
                .andExpect(jsonPath("$[0].name").value("Tapis de course"))
                .andExpect(jsonPath("$[0].type").value("TREADMILL"))
                .andExpect(jsonPath("$[0].category").value("cardio"))
                .andExpect(jsonPath("$[1].id").value(13))
                .andExpect(jsonPath("$[1].type").value("LEG_PRESS"));

        verify(equipmentService).findAll();
    }
}
