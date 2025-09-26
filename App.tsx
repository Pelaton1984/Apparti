import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { TextInput } from './components/TextInput';
import { ActionButton } from './components/ActionButton';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Dialog } from './components/Dialog';
import { editImageWithGemini } from './services/geminiService';
import { AppState } from './types';

const LOGO_URL = "https://i.imgur.com/yD2nL3o.png";
const INITIAL_STATE: AppState = {
  imageFile: null,
  price: '',
  description: '',
  removeItem: '',
  addItem: '',
  background: '',
};

function App() {
  const [appState, setAppState] = useState<AppState>(INITIAL_STATE);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isFontLoaded, setIsFontLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogMessage, setDialogMessage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);
  const logoImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    // Precargar logo
    const logoImg = new Image();
    logoImg.crossOrigin = "Anonymous";
    logoImg.src = LOGO_URL;
    logoImg.onload = () => {
      logoImageRef.current = logoImg;
    };
    logoImg.onerror = () => {
        console.error("No se pudo cargar la marca de agua (logo).");
    }

    // Cargar fuente personalizada
    document.fonts.load('400 48px "Dancing Script"')
      .then(() => setIsFontLoaded(true))
      .catch(err => {
        console.error('La fuente no se pudo cargar:', err);
        setDialogMessage('Error al cargar la fuente. El texto podría no verse correctamente.');
      });
  }, []);

  const handleImageUpload = (file: File) => {
    setAppState(prev => ({ ...prev, imageFile: file }));
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setAppState(prev => ({ ...prev, [id]: value }));
  };
  
  const drawOnCanvas = useCallback((imageSrc: string) => {
    const canvas = outputCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    const logo = logoImageRef.current;
    if (!canvas || !ctx) return;

    const sourceImage = new Image();
    sourceImage.crossOrigin = "Anonymous";
    sourceImage.src = imageSrc;

    sourceImage.onload = () => {
      const canvasWidth = 1080;
      const canvasHeight = 1080;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Dibujar imagen del producto
      ctx.drawImage(sourceImage, 0, 0, canvasWidth, canvasHeight);

      const basePrice = parseFloat(appState.price);
      if (isNaN(basePrice)) return;
      
      const newPrice = Math.floor((basePrice * 1.30 + 50) / 100) * 100;

      const margin = canvasWidth * 0.03;
      const fontSizePrice = canvasHeight * 0.05;
      const fontSizeDesc = canvasHeight * 0.035;

      // Efecto neón para el texto
      ctx.fillStyle = '#FF00FF';
      ctx.shadowColor = '#FF00FF';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Dibujar precio
      const priceText = `$${newPrice.toLocaleString('es-ES')}`;
      ctx.font = `700 ${fontSizePrice}px "Dancing Script"`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(priceText, margin, canvasHeight - margin);
      
      // Dibujar descripción
      const descText = appState.description.length > 50 ? appState.description.substring(0, 47) + '...' : appState.description;
      ctx.font = `400 ${fontSizeDesc}px "Dancing Script"`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(descText, canvasWidth - margin, canvasHeight - margin);

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Dibujar marca de agua (logo)
      if (logo) {
        const logoAspectRatio = logo.naturalWidth / logo.naturalHeight;
        const maxLogoSize = canvasWidth * 0.2;
        let logoWidth = logo.naturalWidth;
        let logoHeight = logo.naturalHeight;

        if (logoWidth > maxLogoSize || logoHeight > maxLogoSize) {
          if (logoAspectRatio > 1) {
            logoWidth = maxLogoSize;
            logoHeight = logoWidth / logoAspectRatio;
          } else {
            logoHeight = maxLogoSize;
            logoWidth = logoHeight * logoAspectRatio;
          }
        }
        ctx.globalAlpha = 0.4;
        ctx.drawImage(logo, canvasWidth - logoWidth - margin, margin, logoWidth, logoHeight);
        ctx.globalAlpha = 1.0;
      }
      
      setGeneratedImage(canvas.toDataURL('image/png'));
    };
  }, [appState.price, appState.description]);

  const handleGenerate = async () => {
    if (!appState.imageFile) {
      setDialogMessage('Por favor, subí una imagen primero.');
      return;
    }
    if (!appState.price || !appState.description || isNaN(parseFloat(appState.price))) {
      setDialogMessage('Por favor, ingresá un precio y una descripción válidos.');
      return;
    }

    const prompt = [
      appState.removeItem ? `Eliminá de la imagen: "${appState.removeItem}".` : '',
      appState.addItem ? `Agregá a la imagen: "${appState.addItem}".` : '',
      appState.background ? `Cambiá el fondo a: "${appState.background}".` : ''
    ].filter(Boolean).join(' ').trim();

    setIsLoading(true);
    setGeneratedImage(null);

    try {
      if (prompt && imagePreviewUrl) {
        const editedImageBase64 = await editImageWithGemini(appState.imageFile, prompt);
        drawOnCanvas(`data:image/png;base64,${editedImageBase64}`);
      } else if (imagePreviewUrl) {
        drawOnCanvas(imagePreviewUrl);
      }
    } catch (error) {
      console.error('Error durante la generación de la imagen:', error);
      setDialogMessage('Ocurrió un error al generar la imagen. Por favor, intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAppState(INITIAL_STATE);
    setImagePreviewUrl(null);
    setGeneratedImage(null);
    setIsLoading(false);
  };
  
  const buttonText = !isFontLoaded ? 'Cargando Fuente...' : isLoading ? 'Procesando...' : 'Generar Imagen';

  return (
    <div className="max-w-4xl w-full mx-auto p-4 min-h-screen">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mt-8 mb-6 text-pink-400 font-dancing">
        Generador de Imágenes de Productos
      </h1>
      <p className="text-center mb-8 text-slate-400">Subí una imagen, agregale detalles y generá una imagen lista para compartir.</p>
      
      <div className="bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-1 bg-slate-700 p-6 rounded-xl flex flex-col items-center justify-center">
            <ImageUploader onImageSelect={handleImageUpload} imagePreviewUrl={imagePreviewUrl} />
          </div>

          <div className="col-span-1 md:col-span-2 flex flex-col justify-between space-y-4">
            <TextInput id="price" label="Precio del Artículo ($)" type="number" placeholder="Ej: 150" value={appState.price} onChange={handleInputChange} />
            <TextInput id="description" label="Descripción (un renglón)" placeholder="Ej: Zapatillas de running cómodas y ligeras" value={appState.description} onChange={handleInputChange} />
            <TextInput id="removeItem" label="Eliminar de la imagen (opcional)" placeholder="Ej: el logo de la marca" value={appState.removeItem} onChange={handleInputChange} />
            <TextInput id="addItem" label="Agregar a la imagen (opcional)" placeholder="Ej: una flor rosa" value={appState.addItem} onChange={handleInputChange} />
            <TextInput id="background" label="Modificar fondo de la imagen (opcional)" placeholder="Ej: un paisaje urbano" value={appState.background} onChange={handleInputChange} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <ActionButton onClick={handleGenerate} disabled={!isFontLoaded || isLoading}>
            {buttonText}
          </ActionButton>
          <ActionButton onClick={handleReset} variant="secondary">
            Reiniciar
          </ActionButton>
        </div>
        
        {isLoading && <LoadingSpinner />}
      </div>
      
      <div className={`mt-8 flex flex-col items-center ${!generatedImage ? 'hidden' : ''}`}>
        <h2 className="text-2xl font-semibold mb-4 text-gray-300">Imagen Generada</h2>
        <canvas ref={outputCanvasRef} className="rounded-2xl shadow-lg max-w-full"></canvas>
        {generatedImage && (
          <a
            href={generatedImage}
            download="imagen_producto_generada.png"
            className="mt-4 bg-green-500 text-white font-bold py-2 px-6 rounded-xl transition-all hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Descargar Imagen
          </a>
        )}
      </div>
      
      {dialogMessage && <Dialog message={dialogMessage} onClose={() => setDialogMessage(null)} />}
    </div>
  );
}

export default App;
