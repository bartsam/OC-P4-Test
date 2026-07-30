package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.dto.TeacherDto;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.mapper.TeacherMapper;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TeacherService {
    private final TeacherRepository teacherRepository;
    private final TeacherMapper teacherMapper;

    public TeacherService(TeacherRepository teacherRepository, TeacherMapper teacherMapper) {
        this.teacherRepository = teacherRepository;
        this.teacherMapper = teacherMapper;
    }

    public List<Teacher> findAll() {
        return this.teacherRepository.findAll();
    }

    public List<TeacherDto> findAllDto() {
        return this.teacherMapper.toDto(findAll());
    }

    public Teacher findById(Long id) {
        Teacher teacher = this.teacherRepository.findById(id).orElse(null);

        if (teacher == null) {
            throw new NotFoundException();
        }

        return teacher;
    }

    public TeacherDto findDtoById(Long id) {
       return this.teacherMapper.toDto(findById(id));
    }

}

