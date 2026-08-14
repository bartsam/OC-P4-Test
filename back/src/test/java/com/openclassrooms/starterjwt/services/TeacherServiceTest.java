package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.mapper.TeacherMapper;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@Tag("teacherServiceUnitTests")
@DisplayName("Teacher Service Unit Tests")
public class TeacherServiceTest {

    @Mock
    private TeacherRepository teacherRepository;
    @Mock
    private TeacherMapper teacherMapper;
    @InjectMocks
    private TeacherService teacherService;

    @Test
    @Tag("findAll")
    @DisplayName("should return all teachers")
    void findAll_shouldReturnAllTeachers() {
        List<Teacher> teachers = List.of(new Teacher(), new Teacher());

        when(teacherRepository.findAll()).thenReturn(teachers);
        List<Teacher> result = teacherService.findAll();

        assertThat(result).hasSize(2);
        verify(teacherRepository, times(1)).findAll();
    }

    @Test
    @Tag("findById")
    @DisplayName("should return a teacher when id exist")
    void findById_shouldReturnTeacher_whenExists() {
        Teacher teacher = new Teacher();
        teacher.setId(1L);
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(teacher));

        Teacher result = teacherService.findById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    @Tag("findById")
    @DisplayName("should throw NotFoundException when id does not exist")
    void findById_shouldReturnNull_whenNotFound() {
        when(teacherRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> teacherService.findById(99L))
                .isInstanceOf(NotFoundException.class);
        verify(teacherRepository, times(1)).findById(99L);
    }

}
