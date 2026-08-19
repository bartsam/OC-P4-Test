package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
public class TeacherControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TeacherRepository teacherRepository;

    @Container
    static MySQLContainer<?> mySQLContainer = new MySQLContainer<>("mysql:8.4.11");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mySQLContainer::getJdbcUrl);
        registry.add("spring.datasource.username", mySQLContainer::getUsername);
        registry.add("spring.datasource.password", mySQLContainer::getPassword);
    }

    @BeforeEach
    void cleanTeacherData() {
        teacherRepository.deleteAll();
    }

    @Nested
    @Tag("findById")
    @DisplayName("Find By Id")
    @WithMockUser
    class FindByIdTests {
        @Test
        @DisplayName("GET /api/teacher/{id} should return teacher when exists")
        void findById_shouldReturnTeacher_whenExists() throws Exception {
            // GIVEN
            Teacher teacher = new Teacher();
            teacher.setFirstName("John");
            teacher.setLastName("Doe");
            Teacher saved = teacherRepository.save(teacher);
            
            // WHEN
            ResultActions result = mockMvc.perform(get("/api/teacher/" + saved.getId()));

            // THEN
            result.andExpect(status().isOk())
                    .andExpect(jsonPath("$.firstName").value("John"));
        }

        @Test
        @WithMockUser
        @DisplayName("GET /api/teacher/{id} - should return 400 when id is invalid")
        void findById_shouldReturnBadRequest_whenIdInvalid() throws Exception {
            mockMvc.perform(get("/api/teacher/invalid-id"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser
        @DisplayName("GET /api/teacher/{id} - should return 404 when teacher does not exist")
        void findById_shouldReturnNotFound_whenDoesNotExist() throws Exception {
            mockMvc.perform(get("/api/teacher/9999"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @Tag("findAll")
    @DisplayName("Find All")
    @WithMockUser
    class FindAllTests {
        @Test
        @DisplayName("GET /api/teacher should return list of teachers")
        void findAll_shouldReturnListTeacher() throws Exception {
            // GIVEN
            Teacher teacherA = new Teacher();
            teacherA.setFirstName("John");
            teacherA.setLastName("Doe");

            Teacher teacherB = new Teacher();
            teacherB.setFirstName("Jean");
            teacherB.setLastName("Biche");

            teacherRepository.save(teacherA);
            teacherRepository.save(teacherB);

            // WHEN
            ResultActions result = mockMvc.perform(get("/api/teacher"));

            //THEN
            result.andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2))
                    .andExpect(jsonPath("$[0].firstName").value("John"))
                    .andExpect(jsonPath("$[1].firstName").value("Jean"));
        }

        @Test
        @DisplayName("GET /api/teacher should return empty list when no teachers")
        void findAll_shouldReturnEmptyList_whenNoTeachers() throws Exception {
            mockMvc.perform(get("/api/teacher"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));
        }
    }

}
