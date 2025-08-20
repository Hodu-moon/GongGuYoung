package xyz.jinjin99.gongguyoung.backend.domain.image.service;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ImageServiceImpl implements ImageService {

  private final ResourceLoader resourceLoader;

  @Value("${image.path:classpath:static/images/}")
  private String imagePath;

  private static final List<String> SUPPORTED_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "gif", "webp", "bmp");

  @Override
  public Resource getImageById(int ino) {
    for (String extension : SUPPORTED_EXTENSIONS) {
      String resourcePath = imagePath + ino + "." + extension;
      Resource resource = resourceLoader.getResource(resourcePath);
      
      if (resource.exists()) {
        return resource;
      }
    }
    
    return null;
  }
}
