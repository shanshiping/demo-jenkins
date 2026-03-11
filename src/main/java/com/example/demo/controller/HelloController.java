package com.example.demo.controller;

import com.example.demo.service.HelloService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HelloController {

    @Autowired
    private HelloService helloService;

    @Value("${app.version:1.0.0}")
    private String appVersion;

    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    /**
     * 基础问候接口
     */
    @GetMapping("/hello")
    public Map<String, String> hello() {
        Map<String, String> result = new HashMap<>();
        result.put("message", helloService.getGreeting());
        result.put("version", appVersion);
        result.put("env", activeProfile);
        return result;
    }

    /**
     * 应用信息接口 - Jenkins 部署后可用于验证
     */
    @GetMapping("/info")
    public Map<String, String> info() {
        Map<String, String> info = new HashMap<>();
        info.put("app", "Spring Boot Jenkins Demo");
        info.put("version", appVersion);
        info.put("env", activeProfile);
        info.put("status", "running");
        return info;
    }
}
