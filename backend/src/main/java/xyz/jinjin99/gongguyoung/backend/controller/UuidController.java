package xyz.jinjin99.gongguyoung.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
public class UuidController {

  @GetMapping("/api/uuid")
  public String getUuid() {
    return UUID.randomUUID().toString();
  }
}
