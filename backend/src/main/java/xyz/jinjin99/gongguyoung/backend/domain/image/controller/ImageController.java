package xyz.jinjin99.gongguyoung.backend.domain.image.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import xyz.jinjin99.gongguyoung.backend.domain.image.service.ImageService;

@RestController
@RequestMapping("/api/v1/images")
@RequiredArgsConstructor
public class ImageController {

  private final ImageService imageService;

  @GetMapping("/{id}")
  public ResponseEntity<Resource> serveImage(@PathVariable Integer id) {
    Resource img = imageService.getImageById(id);

    if (img == null) {
      return ResponseEntity.notFound().build();
    }
    
    String contentType = getContentType(img);

    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(contentType))
        .body(img);
  }

  private String getContentType(Resource resource) {
    try {
      Path path = Paths.get(resource.getURI());
      String contentType = Files.probeContentType(path);
      return contentType != null ? contentType : "application/octet-stream";
    } catch (IOException e) {
      return "application/octet-stream";
    }
  }
}
