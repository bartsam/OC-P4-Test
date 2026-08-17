package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
public class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

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
    @Tag("login")
    @DisplayName("Login user")
    class LoginTests {
        @Test
        @DisplayName("POST /api/auth/login should return JWT token")
        void login_shouldReturnToken_whenCredentialsValid() throws Exception {
            // GIVEN
            User user = new User("test@test.com", "Biche", "Jean", passwordEncoder.encode("Password123!"), false);
            userRepository.save(user);

            LoginRequest loginRequest = new LoginRequest();
            loginRequest.setEmail("test@test.com");
            loginRequest.setPassword("Password123!");

            // WHEN
            ResultActions result = mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(loginRequest)));

            // THEN
            result.andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").isNotEmpty());
        }

        @Test
        @DisplayName("POST /api/auth/login should return 401 when user does not exist")
        void login_shouldReturnUnauthorized_whenUserDoesNotExist() throws Exception {
            // GIVEN
            LoginRequest loginRequest = new LoginRequest();
            loginRequest.setEmail("test@test.com");
            loginRequest.setPassword("Password123!");

            // WHEN
            ResultActions result = mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(loginRequest)));

            // THEN
            result.andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("POST /api/auth/login should return 401 when password incorrect")
        void login_shouldReturnUnauthorized_whenPasswordIncorrect() throws Exception {
            // GIVEN
            User user = new User("test@test.com", "Biche", "Jean", passwordEncoder.encode("Password123!"), false);
            userRepository.save(user);

            LoginRequest loginRequest = new LoginRequest();
            loginRequest.setEmail("test@test.com");
            loginRequest.setPassword("123Password!");

            // WHEN
            ResultActions result = mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(loginRequest)));

            // THEN
            result.andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @Tag("register")
    @DisplayName("Register user")
    class RegisterTests {
        @Test
        @DisplayName("POST /api/auth/register should create user when email is new")
        void register_shouldCreateUser_whenEmailAvailable() throws Exception {
            // GIVEN
            SignupRequest signupRequest = new SignupRequest();
            signupRequest.setEmail("test@test.com");
            signupRequest.setFirstName("Jean");
            signupRequest.setLastName("Biche");
            signupRequest.setPassword("Password123!");

            // WHEN
            ResultActions result = mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(signupRequest)));

            // THEN
            result.andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("User registered successfully!"));

            assertThat(userRepository.existsByEmail("test@test.com")).isTrue();
        }

        @Test
        @DisplayName("POST /register should return 400 when email exists")
        void register_shouldReturnBadRequest_whenEmailExists() throws Exception {
            // GIVEN
            User user = new User("test@test.com", "Biche", "Jean",
                    passwordEncoder.encode("Password123!"), false);
            userRepository.save(user);

            SignupRequest signupRequest = new SignupRequest();
            signupRequest.setEmail("test@test.com");
            signupRequest.setFirstName("Jean");
            signupRequest.setLastName("Biche");
            signupRequest.setPassword("Password123!");

            // WHEN
            ResultActions result = mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(signupRequest)));

            // THEN
            result.andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("POST /api/auth/register should return 400 when missing field")
        void register_shouldReturnBadRequest_whenFieldBlank() throws Exception {
            // GIVEN
            SignupRequest signupRequest = new SignupRequest();
            signupRequest.setEmail("");
            signupRequest.setFirstName("Jean");
            signupRequest.setLastName("Biche");
            signupRequest.setPassword("Password123!");

            // WHEN
            ResultActions result = mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(signupRequest)));

            // THEN
            result.andExpect(status().isBadRequest());
        }

    }
}
