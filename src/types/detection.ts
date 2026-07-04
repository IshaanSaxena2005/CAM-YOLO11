export interface Detection {
  /**
   * Human readable class name of the detected object.
   */
  class: string;
  /**
   * Confidence score between 0 and 1.
   */
  confidence: number;
  /**
   * Bounding box as [ymin, xmin, ymax, xmax] normalized (0‑1).
   */
  boundingBox: [number, number, number, number];
  /**
   * Hex or CSS color string for rendering the detection.
   */
  color: string;
}

export interface DetectionResponse {
  detectionId: string;
  imageName: string;
  timestamp: string; // ISO string
  processingTime: number; // milliseconds
  modelName: string;
  detections: Detection[];
}
