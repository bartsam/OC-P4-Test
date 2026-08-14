package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.dto.TeacherDto;
import com.openclassrooms.starterjwt.mapper.TeacherMapper;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.services.TeacherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/teacher")
public class TeacherController {
    private final TeacherService teacherService;
    private final TeacherMapper teacherMapper;


    public TeacherController(TeacherService teacherService, TeacherMapper teacherMapper) {
        this.teacherService = teacherService;
        this.teacherMapper = teacherMapper;
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeacherDto> findById(@PathVariable("id") String id) {
        Teacher teacher = teacherService.findById(Long.valueOf(id));
        return ResponseEntity.ok(teacherMapper.toDto(teacher));
    }

    @GetMapping()
    public ResponseEntity<List<TeacherDto>> findAll() {
        List<Teacher> teachers = teacherService.findAll();
        return ResponseEntity.ok().body(teacherMapper.toDto(teachers));
    }
}
