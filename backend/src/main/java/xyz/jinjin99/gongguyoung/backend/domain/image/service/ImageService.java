package xyz.jinjin99.gongguyoung.backend.domain.image.service;

import org.springframework.core.io.Resource;

public interface ImageService {
  Resource getImageById(int ino);
}
