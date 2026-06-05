package huesitos_backend.servicios;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Iterator;
import java.util.UUID;
import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.FileImageOutputStream;

@Service
public class StorageService {

    private final String UPLOAD_DIR = "uploads/";
    private final String CLINICOS_DIR = "uploads/clinicos/";

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
            Files.createDirectories(Paths.get(CLINICOS_DIR));
        } catch (IOException e) {
            throw new RuntimeException("No se pudieron crear las carpetas de uploads", e);
        }
    }

    /**
     * Comprime y guarda una foto recibida en la carpeta de uploads.
     */
    public String comprimirYGuardarFoto(MultipartFile archivo, String prefijo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new RuntimeException("El archivo está vacío");
        }

        try {
            // 1. Leer imagen en memoria
            BufferedImage imagenOriginal = ImageIO.read(archivo.getInputStream());
            if (imagenOriginal == null) {
                throw new RuntimeException("El archivo no es una imagen válida");
            }

            // 2. Redimensionar si supera los 800px de ancho
            BufferedImage imagenFinal = redimensionarSiEsNecesario(imagenOriginal, 800);

            // 3. Nombre único del archivo
            String nombreArchivo = prefijo + "_" + UUID.randomUUID().toString() + ".jpg";

            // 4. Configurar ImageWriter para compresión JPG (70% de calidad)
            File outputFile = new File(UPLOAD_DIR + nombreArchivo);
            guardarConCompresion(imagenFinal, outputFile);

            // 5. Retornar la URL relativa
            return "/uploads/" + nombreArchivo;

        } catch (IOException e) {
            throw new RuntimeException("Error al procesar y guardar la imagen", e);
        }
    }

    private BufferedImage redimensionarSiEsNecesario(BufferedImage original, int maxAncho) {
        int anchoOriginal = original.getWidth();
        int altoOriginal = original.getHeight();

        if (anchoOriginal <= maxAncho) {
            return original;
        }

        double ratio = (double) maxAncho / anchoOriginal;
        int nuevoAncho = maxAncho;
        int nuevoAlto = (int) (altoOriginal * ratio);

        BufferedImage redimensionada = new BufferedImage(nuevoAncho, nuevoAlto, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = redimensionada.createGraphics();
        
        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g2d.drawImage(original, 0, 0, nuevoAncho, nuevoAlto, null);
        g2d.dispose();

        return redimensionada;
    }

    private void guardarConCompresion(BufferedImage imagen, File outputFile) throws IOException {
        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");
        if (!writers.hasNext()) {
            throw new RuntimeException("No se encontró un escritor de imágenes para JPG");
        }
        
        ImageWriter writer = writers.next();
        ImageWriteParam param = writer.getDefaultWriteParam();
        param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
        param.setCompressionQuality(0.7f); // 70% de calidad

        try (FileImageOutputStream outputStream = new FileImageOutputStream(outputFile)) {
            writer.setOutput(outputStream);
            writer.write(null, new IIOImage(imagen, null, null), param);
        } finally {
            writer.dispose();
        }
    }

    /**
     * Guarda un archivo clínico de forma genérica (PDF, imágenes, etc.) en uploads/clinicos/
     * sin alterar ni comprimir su contenido.
     */
    public String guardarArchivoClinico(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new RuntimeException("El archivo está vacío");
        }

        try {
            // Nombre original y extensión
            String nombreOriginal = archivo.getOriginalFilename();
            String extension = "";
            if (nombreOriginal != null && nombreOriginal.contains(".")) {
                extension = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
            }

            // Nombre único con UUID
            String nombreArchivo = UUID.randomUUID().toString() + extension;

            // Ruta de guardado
            File destino = new File(CLINICOS_DIR + nombreArchivo);
            archivo.transferTo(destino);

            // URL relativa de acceso
            return "/uploads/clinicos/" + nombreArchivo;
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar el archivo clínico", e);
        }
    }
}
