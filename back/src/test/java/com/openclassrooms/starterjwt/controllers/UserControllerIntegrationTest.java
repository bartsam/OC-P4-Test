package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
public class UserControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Container
    static MySQLContainer<?> mySQLContainer = new MySQLContainer<>("mysql:8.4.11");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mySQLContainer::getJdbcUrl);
        registry.add("spring.datasource.username", mySQLContainer::getUsername);
        registry.add("spring.datasource.password", mySQLContainer::getPassword);
    }

    @BeforeEach
    void cleanUserData() {
        userRepository.deleteAll();
    }

    @Nested
    @Tag("findById")
    @DisplayName("Find User By Id")
    class FindByIdTests {
        @Test
        @WithMockUser
        @DisplayName("GET /api/user/{id} should return user when exists")
        void findById_shouldReturnUser_whenExists() throws Exception {
            // GIVEN
            User user = new User("test@test.com", "Biche", "Jean", "Password123!", false);
            User saved = userRepository.save(user);
            // WHEN
            ResultActions result = mockMvc.perform(get("/api/user/" + saved.getId()));
            // THEN
            result.andExpect(status().isOk()).andExpect(jsonPath("$.lastName").value("Biche"));
        }

        @Test
        @DisplayName("GET /api/user/{id} should return 401 when not authenticated")
        void findById_shouldReturnUnauthorized_whenNotAuthenticated() throws Exception {
            mockMvc.perform(get("/api/user/1"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @WithMockUser
        @DisplayName("GET /api/user/{id} - should return 400 when id is invalid")
        void findById_shouldReturnBadRequest_whenIdInvalid() throws Exception {
            mockMvc.perform(get("/api/user/invalid-id"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser
        @DisplayName("GET /api/user/{id} - should return 404 when user does not exist")
        void findById_shouldReturnNotFound_whenDoesNotExist() throws Exception {
            mockMvc.perform(get("/api/user/9999"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @Tag("delete")
    @DisplayName("Delete User")
    class DeleteTests {
        @Test
        @WithMockUser(username = "test@test.com")
        @DisplayName("DELETE /api/user/{id} should delete user")
        void delete_shouldDeleteUser() throws Exception {
            // GIVEN
            User user = new User("test@test.com", "Biche", "Jean", "Password123!", false);
            User saved = userRepository.save(user);
            // WHEN
            ResultActions result = mockMvc.perform(delete("/api/user/" + saved.getId()));
            // THEN
            result.andExpect(status().isOk());
        }

        @Test
        @WithMockUser(username = "other@test.com")
        @DisplayName("DELETE /api/user/{id} should return 401 when user is not owner")
        void delete_shouldReturnUnauthorized_whenNotOwner() throws Exception {
            // GIVEN
            User user = new User("test@test.com", "Biche", "Jean", "Password123!", false);
            User saved = userRepository.save(user);
            // WHEN
            ResultActions result = mockMvc.perform(delete("/api/user/" + saved.getId()));
            // THEN
            result.andExpect(status().isUnauthorized());
        }

        @Test
        @WithMockUser
        @DisplayName("DELETE /api/user/{id} should return 400 when id is invalid")
        void delete_shouldReturnBadRequest_whenIdInvalid() throws Exception {
            mockMvc.perform(delete("/api/user/invalid-id"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser
        @DisplayName("DELETE /api/user/{id} should return 404 when user does not exist")
        void delete_shouldReturnNotFound_whenUserDoesNotExist() throws Exception {
            mockMvc.perform(delete("/api/user/9999"))
                    .andExpect(status().isNotFound());
        }
    }
}
