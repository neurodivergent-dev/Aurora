import React, { useState } from 'react';
import { Text, StyleSheet, TextStyle, View, Image, TouchableOpacity, Modal, SafeAreaView, Dimensions } from 'react-native';
import { useAIStore } from '../store/aiStore';
import { useMusicStore } from '../store/musicStore';
import { X, ZoomIn, ImagePlus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system/legacy';
import logger from '../utils/logger';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MarkdownTextProps {
  content: string;
  style?: TextStyle;
  baseColor?: string;
}

/**
 * Gemini'den gelen Markdown yapılarını (**bold**, *italic*, listeler) destekleyen hafif bir bileşen.
 */
export const MarkdownText: React.FC<MarkdownTextProps> = ({ content, style, baseColor }) => {
  const lines = content.split('\n');
  const { pollinationsApiKey, localSdIp, localSdPort } = useAIStore();
  const { currentTrack, setTrackArtwork } = useMusicStore();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewPrompt, setPreviewPrompt] = useState<string | null>(null);
  const [isLocalGenerating, setIsLocalGenerating] = useState<Record<number, boolean>>({});
  const [generatedLocalImages, setGeneratedLocalImages] = useState<Record<number, string>>({});
  const [lastProcessedIndex, setLastProcessedIndex] = useState<number | null>(null);

  // --- OTOMATİK ÜRETİM MANTIĞI ---
  // Hook, bileşen seviyesinde olmalı (koşul dışında)
  React.useEffect(() => {
    // İçerikteki [IMAGE:prompt] yapılarını bul
    lines.forEach((line, index) => {
      const imageMatch = line.match(/\[IMAGE:(.*?)\]/);
      if (imageMatch && localSdIp && !generatedLocalImages[index] && !isLocalGenerating[index]) {
        const rawPrompt = imageMatch[1].trim();
        handleLocalGenerate(rawPrompt, index);
      }
    });
  }, [lines, localSdIp]); // İçerik veya IP değiştiğinde tetikle

  const handleLocalGenerate = async (rawPrompt: string, index: number) => {
    if (!localSdIp) return;
    try {
      const finalPort = localSdPort || '7860';
      setIsLocalGenerating(prev => ({ ...prev, [index]: true }));
      const response = await fetch(`http://${localSdIp}:${finalPort}/sdapi/v1/txt2img`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: rawPrompt,
          steps: 20,
          width: 512,
          height: 512,
          cfg_scale: 7,
          sampler_name: "Euler a"
        })
      });
      const data = await response.json();
      if (data.images && data.images.length > 0) {
        const base64Str = data.images[0];

        // Öngörülebilir dosya adı (Prompt bazlı hash kullanarak)
        const promptHash = rawPrompt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0).toString();
        const fileName = `local_sd_${promptHash}.png`;
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;

        await FileSystem.writeAsStringAsync(fileUri, base64Str, {
          encoding: FileSystem.EncodingType.Base64,
        });

        setGeneratedLocalImages(prev => ({ ...prev, [index]: fileUri }));
        logger.info(`Resim gizli klasöre kaydedildi: ${fileUri}`, 'MarkdownText');
      }
    } catch (err) {
      logger.error(`Local SD Error: ${err}`, 'MarkdownText');
    } finally {
      setIsLocalGenerating(prev => ({ ...prev, [index]: false }));
    }
  };

  const renderStyledText = (text: string, key: string | number) => {
    // Bold ve Italic için regex (önce bold, sonra italic)
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);

    return (
      <Text key={key} style={[style, { color: baseColor }]}>
        {parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <Text key={index} style={styles.bold}>
                {part.substring(2, part.length - 2)}
              </Text>
            );
          }
          if (part.startsWith('*') && part.endsWith('*')) {
            return (
              <Text key={index} style={styles.italic}>
                {part.substring(1, part.length - 1)}
              </Text>
            );
          }
          return part;
        })}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      {lines.map((line, index) => {
        const trimmedLine = line.trim();

        // Liste elemanı kontrolü (* veya -)
        if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
          return (
            <View key={index} style={styles.listRow}>
              <Text style={[style, { color: baseColor, marginRight: 6 }]}>•</Text>
              <View style={styles.listContent}>
                {renderStyledText(trimmedLine.substring(2), index)}
              </View>
            </View>
          );
        }

        // Boş satır
        if (trimmedLine === '') {
          return <View key={index} style={{ height: 8 }} />;
        }

        // Görüntü (Image) kontrolü: [IMAGE:prompt]
        const imageRegex = /\[IMAGE:(.*?)\]/;
        const imageMatch = line.match(imageRegex);

        if (imageMatch) {
          const rawPrompt = imageMatch[1].trim();
          const cleanLine = line.replace(imageRegex, '').trim();
          const encodedPrompt = encodeURIComponent(rawPrompt);

          // Stable seed
          const seed = rawPrompt.split('').reduce((acc, char) => acc + (char.charCodeAt(0) * 31), 0) % 100000;

          let imageUrl = '';
          if (localSdIp) {
            const finalPort = localSdPort || '7860';
            imageUrl = `http://${localSdIp}:${finalPort}/sdapi/v1/txt2img`;
          } else {
            const authParam = pollinationsApiKey ? `&key=${pollinationsApiKey}` : '';
            imageUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?width=800&height=800&seed=${seed}&model=flux&nologo=true${authParam}`;
          }


          const isLocal = !!localSdIp;
          const localStoredImage = generatedLocalImages[index];

          return (
            <View key={index} style={styles.lineContent}>
              {cleanLine !== '' && renderStyledText(cleanLine, `text-${index}`)}
              <TouchableOpacity
                style={styles.imageContainer}
                onPress={() => {
                  if (isLocal && !localStoredImage) {
                    handleLocalGenerate(rawPrompt, index);
                  } else {
                    setPreviewImage(localStoredImage || imageUrl);
                    setPreviewPrompt(rawPrompt);
                  }
                }}
                activeOpacity={0.9}
              >
                {isLocal && !localStoredImage ? (
                  <View style={[styles.image, { backgroundColor: '#1C1C1E', justifyContent: 'center', alignItems: 'center' }]}>
                    {isLocalGenerating[index] ? (
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: '#FFFFFF', marginBottom: 10 }}>Yerel SD Üretiyor...</Text>
                      </View>
                    ) : (
                      <View style={{ alignItems: 'center' }}>
                        <ImagePlus size={48} color="#FFFFFF" opacity={0.5} />
                        <Text style={{ color: '#FFFFFF', marginTop: 12, fontWeight: '600' }}>Yerel SD ile Üret</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 }}>Juggernaut @ {localSdIp}:{localSdPort || '7860'}</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <Image
                    source={{ uri: localStoredImage || imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                )}

                {!pollinationsApiKey && !isLocal && (
                  <View style={styles.keyOverlay}>
                    <Text style={styles.keyWarningText}>API Key Required</Text>
                  </View>
                )}

                <View style={styles.imageActionButtons}>
                  {currentTrack && (localStoredImage || !isLocal) && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: 'rgba(99, 102, 241, 0.8)' }]}
                      onPress={() => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        setTrackArtwork(currentTrack.id, localStoredImage || imageUrl);
                      }}
                    >
                      <ImagePlus size={16} color="#FFFFFF" strokeWidth={2.5} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      if (isLocal && !localStoredImage) handleLocalGenerate(rawPrompt, index);
                      else {
                        setPreviewImage(localStoredImage || imageUrl);
                        setPreviewPrompt(rawPrompt);
                      }
                    }}
                  >
                    <ZoomIn size={16} color="#FFFFFF" strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
              <Text style={styles.imagePromptOuter}>"{rawPrompt}"</Text>
            </View>
          );
        }

        // Normal satır
        return renderStyledText(line, index);
      })}

      <Modal
        visible={!!previewImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setPreviewImage(null)}
          >
            <X size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.modalImageContainer}>
            <Image
              source={{ uri: previewImage || undefined }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  bold: {
    fontWeight: '900',
  },
  italic: {
    fontStyle: 'italic',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  listContent: {
    flex: 1,
  },
  lineContent: {
    width: '100%',
    marginVertical: 4,
  },
  imageContainer: {
    marginVertical: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000000',
    minHeight: 250,
    width: '100%',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  imagePromptOuter: {
    fontSize: 10,
    color: '#8E8E93',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 4,
    paddingHorizontal: 12,
  },
  keyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyWarningText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    padding: 20,
  },
  imageActionButtons: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  modalImageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
});
