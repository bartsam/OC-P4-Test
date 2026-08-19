package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
public class SessionControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SessionRepository sessionRepository;
    @Autowired
    private TeacherRepository teacherRepository;
    @Autowired
    private UserRepository userRepository;
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
        sessionRepository.deleteAll();
        userRepository.deleteAll();
        teacherRepository.deleteAll();
    }


    private Teacher createTeacher() {
        Teacher teacher = new Teacher();
        teacher.setFirstName("John");
        teacher.setLastName("Doe");
        return teacherRepository.save(teacher);
    }

    private Session createSession(Teacher teacher, List<User> users) {
        Session session = new Session();
        session.setName("Session name");
        session.setDate(new Date());
        session.setDescription("Session description");
        session.setTeacher(teacher);
        session.setUsers(users);
        return sessionRepository.save(session);
    }

    private Session createSession(Teacher teacher) {
        return createSession(teacher, new ArrayList<>());
    }


    private User createUser() {
        User user = new User();
        user.setEmail("test@test.com");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setPassword("Password123!");
        user.setAdmin(false);
        return userRepository.save(user);
    }

    @Nested
    @Tag("getById")
    @DisplayName("Get Session By Id")
    class GetByIdTests {
        @Test
        @WithMockUser
        @DisplayName("GET /api/session/{id} should return session when exists")
        void getById_shouldReturnSession_whenExists() throws Exception {
            //GIVEN
            Teacher teacher = createTeacher();
            Session saved = createSession(teacher);

            // WHEN
            ResultActions result = mockMvc.perform(get("/api/session/" + saved.getId()));

            // THEN
            result.andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("Session name"));
        }

        @Test
        @WithMockUser
        @DisplayName("GET /api/session/{id} should return 400 when id is invalid")
        void getById_shouldReturnBadRequest_whenIdInvalid() throws Exception {
            mockMvc.perform(get("/api/session/invalid-id"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser
        @DisplayName("GET /api/session/{id} should return 404 when not found")
        void getById_shouldReturnNotFound_whenDoesNotExist() throws Exception {
            mockMvc.perform(get("/api/session/9999"))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("GET /api/session/{id} should return 401 when user is not logged")
        void getById_shouldReturnUnauthorized_whenNotLogged() throws Exception {
            //GIVEN
            Teacher teacher = createTeacher();
            Session saved = createSession(teacher);

            // WHEN
            ResultActions result = mockMvc.perform(get("/api/session/" + saved.getId()));

            // THEN
            result.andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @Tag("findAll")
    @DisplayName("Find All Sessions")
    class FindAllTests {
        @Test
        @WithMockUser
        @DisplayName("GET /api/session should return List of sessions")
        void findAll_shouldReturnListSession() throws Exception {
            //GIVEN
            Teacher teacher = createTeacher();
            createSession(teacher);
            createSession(teacher);

            // WHEN
            ResultActions result = mockMvc.perform(get("/api/session"));

            // THEN
            result.andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2));
        }

        @Test
        @WithMockUser
        @DisplayName("GET /api/session should return empty list when none exist")
        void findAll_shouldReturnEmptyList() throws Exception {
            mockMvc.perform(get("/api/session"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));
        }

    }

    @Nested
    @Tag("create")
    @DisplayName("Create Session")
    @WithMockUser
    class CreateTests {
        @Test
        @DisplayName("POST /api/session should create session when valid")
        void create_shouldCreateSession_whenValid() throws Exception {
            //GIVEN
            Teacher teacher = createTeacher();
            SessionDto sessionDto = new SessionDto();
            sessionDto.setName("New session");
            sessionDto.setDate(new Date());
            sessionDto.setDescription("Description");
            sessionDto.setTeacher_id(teacher.getId());

            // WHEN
            ResultActions result = mockMvc.perform(post("/api/session")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(sessionDto)));

            // THEN
            result.andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("New session"));
            assertThat(sessionRepository.count()).isEqualTo(1);

        }

        @Test
        @DisplayName("POST /api/session should return 400 when field is blank")
        void create_shouldReturnBadRequest_whenNameBlank() throws Exception {
            //GIVEN
            SessionDto sessionDto = new SessionDto();
            sessionDto.setName("");
            sessionDto.setDate(new Date());
            sessionDto.setDescription("Description");

            // WHEN
            ResultActions result = mockMvc.perform(post("/api/session")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(sessionDto)));
            // THEN
            result.andExpect(status().isBadRequest());
        }
    }

    @Nested
    @Tag("update")
    @DisplayName("Update Session")
    @WithMockUser
    class UpdateTests {
        @Test
        @DisplayName("PUT /api/session/{id} should update session")
        void update_shouldUpdateSession() throws Exception {
            //GIVEN
            Teacher teacher = createTeacher();
            Session session = createSession(teacher);

            SessionDto sessionDto = new SessionDto();
            sessionDto.setName("Updated session");
            sessionDto.setDate(new Date());
            sessionDto.setDescription("Updated Description");
            sessionDto.setTeacher_id(teacher.getId());

            // WHEN
            ResultActions result = mockMvc.perform(put("/api/session/" + session.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(sessionDto)));

            // THEN
            result.andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("Updated session"));

        }

        @Test
        @DisplayName("PUT /api/session/{id} should return 400 when id is invalid")
        void create_shouldReturnBadRequest_whenIdInvalid() throws Exception {
            //GIVEN
            Teacher teacher = createTeacher();

            SessionDto sessionDto = new SessionDto();
            sessionDto.setName("Name");
            sessionDto.setDate(new Date());
            sessionDto.setDescription("Description");
            sessionDto.setTeacher_id(teacher.getId());

            // WHEN
            ResultActions result = mockMvc.perform(put("/api/session/invalid-id")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(sessionDto)));
            // THEN
            result.andExpect(status().isBadRequest());
        }
    }

    @Nested
    @Tag("delete")
    @DisplayName("Delete Session")
    @WithMockUser
    class DeleteTests {
        @Test
        @DisplayName("DELETE /api/session/{id} should delete session")
        void delete_shouldDeleteSession() throws Exception {
            //GIVEN
            Teacher teacher = createTeacher();
            Session session = createSession(teacher);

            // WHEN
            ResultActions result = mockMvc.perform(delete("/api/session/" + session.getId()));

            // THEN
            result.andExpect(status().isOk());
            assertThat(sessionRepository.existsById(session.getId())).isFalse();

        }

        @Test
        @DisplayName("DELETE /api/session/{id} should return 400 when id is invalid")
        void delete_shouldReturnBadRequest_whenIdInvalid() throws Exception {
            mockMvc.perform(delete("/api/session/invalid-id"))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @Tag("participate")
    @DisplayName("Participate to session")
    @WithMockUser
    class ParticipateTests {
        @Test
        @DisplayName("POST /api/session/{id}/participate/{userId} should add user")
        void participate_shouldAddUser_whenValid() throws Exception {
            // GIVEN
            Teacher teacher = createTeacher();
            User user = createUser();
            Session session = createSession(teacher);

            // WHEN
            ResultActions result = mockMvc.perform(post("/api/session/" + session.getId() + "/participate/" + user.getId()));

            // THEN
            result.andExpect(status().isOk());
            List<User> updatedSessionUsers = sessionRepository.findById(session.getId()).orElseThrow().getUsers();
            assertThat(updatedSessionUsers)
                    .extracting(User::getId)
                    .contains(user.getId());
        }

        @Test
        @DisplayName("POST /api/session/{id}/participate/{userId} should return 400 when already participating")
        void participate_shouldReturnBadRequest_whenAlreadyParticipating() throws Exception {
            // GIVEN
            Teacher teacher = createTeacher();
            User user = createUser();
            Session session = createSession(teacher, List.of(user));

            // WHEN
            ResultActions result = mockMvc.perform(post("/api/session/" + session.getId() + "/participate/" + user.getId()));

            // THEN
            result.andExpect(status().isBadRequest());
        }
    }

    @Nested
    @Tag("noLongerParticipate")
    @DisplayName("No Longer Participate")
    @WithMockUser
    class NoLongerParticipateTests {
        @Test
        @DisplayName("DELETE /api/session/{id}/participate/{userId} should remove user")
        void noLongerParticipate_shouldRemoveUser_whenParticipating() throws Exception {
            Teacher teacher = createTeacher();
            User user = createUser();
            Session session = createSession(teacher, List.of(user));

            // WHEN
            ResultActions result = mockMvc.perform(delete("/api/session/" + session.getId() + "/participate/" + user.getId()));

            // THEN
            result.andExpect(status().isOk());
            List<User> updatedSessionUsers = sessionRepository.findById(session.getId()).orElseThrow().getUsers();
            assertThat(updatedSessionUsers)
                    .extracting(User::getId)
                    .doesNotContain(user.getId());
        }

        @Test
        @DisplayName("DELETE /api/session/{id}/participate/{userId} should return 400 when not participating")
        void noLongerParticipate_shouldReturnBadRequest_whenNotParticipating() throws Exception {
            Teacher teacher = createTeacher();
            User user = createUser();
            Session session = createSession(teacher);

            // WHEN
            ResultActions result = mockMvc.perform(delete("/api/session/" + session.getId() + "/participate/" + user.getId()));

            // THEN
            result.andExpect(status().isBadRequest());
        }
    }
}
