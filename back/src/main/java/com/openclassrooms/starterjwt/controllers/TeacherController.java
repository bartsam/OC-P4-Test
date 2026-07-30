package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.dto.TeacherDto;
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


    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeacherDto> findById(@PathVariable("id") String id) {
        return ResponseEntity.ok().body(this.teacherService.findDtoById(Long.valueOf(id)));
    }

    @GetMapping()
    public ResponseEntity<List<TeacherDto>> findAll() {
        return ResponseEntity.ok().body(this.teacherService.findAllDto());
    }
}
