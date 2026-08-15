package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.dto.UserDto;
import com.openclassrooms.starterjwt.mapper.UserMapper;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    public UserController(UserService userService, UserMapper userMapper) {
        this.userService = userService;
        this.userMapper = userMapper;
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> findById(@PathVariable("id") String id) {
        User user = this.userService.findById(Long.valueOf(id));
        return ResponseEntity.ok().body(userMapper.toDto(user));
    }

    @DeleteMapping("{id}")
    public ResponseEntity<Void> save(@PathVariable("id") String id) {
        this.userService.deleteIfOwner(Long.valueOf(id));
        return ResponseEntity.ok().build();
    }
}
