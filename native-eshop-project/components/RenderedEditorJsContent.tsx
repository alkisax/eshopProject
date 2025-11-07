// native-eshop-project/components/RenderedEditorJsContent.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, Linking } from 'react-native';
import { Checkbox, Card } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import type { EditorJsContent } from '../types/blogTypes';

/*
  📌 Native adaptation of RenderedEditorJsContent
  - Replaces DOMPurify + MUI with native-safe rendering.
  - All text rendered as plain text (no dangerous HTML).
  - Handles paragraph, header, list, image, quote, embed, code, attaches, etc.
*/

interface Props {
  editorJsData: EditorJsContent | null;
  subPageName: string;
}

const RenderedEditorJsContent = ({ editorJsData, subPageName }: Props) => {
  if (!editorJsData?.blocks?.length) return null;

  return (
    <View style={styles.container}>
      {subPageName ? (
        <Text style={styles.subPage}>📄 Page: {subPageName}</Text>
      ) : null}

      {editorJsData.blocks.map((block, i) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <Text key={i} style={[styles.text, { textAlign: block.data.alignment || 'left' }]}>
                {stripTags(block.data.text)}
              </Text>
            );

          case 'header':
            return (
              <Text
                key={i}
                style={[
                  styles[`h${block.data.level}` as keyof typeof styles] || styles.h2,
                  { textAlign: block.tunes?.alignment?.alignment || 'left' },
                ]}
              >
                {stripTags(block.data.text)}
              </Text>
            );

          case 'image':
            return (
              <View key={i} style={styles.imageBox}>
                <Image
                  source={{ uri: block.data.file.url }}
                  style={styles.image}
                  resizeMode="contain"
                />
                {block.data.caption && (
                  <Text style={styles.caption}>{block.data.caption}</Text>
                )}
              </View>
            );

          case 'list':
            // ✅ Checklist
            if (block.data.style === 'checklist') {
              return (
                <View key={i} style={styles.listBox}>
                  {block.data.items.map((item: any, j: number) => {
                    const checked = typeof item === 'object' ? !!item.meta?.checked : false;
                    const label = typeof item === 'string' ? item : item.content;
                    return (
                      <View key={j} style={styles.checkItem}>
                        <Checkbox status={checked ? 'checked' : 'unchecked'} disabled />
                        <Text style={styles.listText}>{label}</Text>
                      </View>
                    );
                  })}
                </View>
              );
            }

            // ✅ Ordered/Unordered list
            return (
              <View key={i} style={styles.listBox}>
                {block.data.items.map((item: any, j: number) => {
                  const label = typeof item === 'string' ? item : item.content;
                  return (
                    <Text key={j} style={styles.listText}>
                      • {stripTags(label)}
                    </Text>
                  );
                })}
              </View>
            );

          case 'quote':
            return (
              <Card key={i} style={styles.quote}>
                <Text style={styles.quoteText}>{block.data.text}</Text>
                {block.data.caption && (
                  <Text style={styles.caption}>— {block.data.caption}</Text>
                )}
              </Card>
            );

          case 'embed':
            return (
              <View key={i} style={styles.embedBox}>
                <WebView
                  source={{ uri: block.data.embed }}
                  style={{ height: block.data.height || 315, width: '100%' }}
                  allowsFullscreenVideo
                />
                {block.data.caption && (
                  <Text style={styles.caption}>{block.data.caption}</Text>
                )}
              </View>
            );

          case 'attaches':
            return (
              <Text
                key={i}
                style={styles.attachment}
                onPress={() => Linking.openURL(block.data.file.url)}
              >
                📎 {block.data.title || block.data.file.name || 'Attachment'}
              </Text>
            );

          case 'inlineCode':
            return (
              <Text key={i} style={styles.inlineCode}>
                {block.data.code}
              </Text>
            );

          default:
            return null;
        }
      })}
    </View>
  );
};

// --- helpers ---
const stripTags = (html: string) => html.replace(/<[^>]+>/g, '').trim();

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  subPage: {
    color: 'gray',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
    marginBottom: 10,
  },
  h1: { fontSize: 26, fontWeight: 'bold', marginVertical: 8 },
  h2: { fontSize: 22, fontWeight: 'bold', marginVertical: 8 },
  h3: { fontSize: 18, fontWeight: '600', marginVertical: 6 },
  imageBox: {
    alignItems: 'center',
    marginVertical: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  caption: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
    textAlign: 'center',
  },
  listBox: {
    marginVertical: 8,
    paddingLeft: 16,
  },
  listText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quote: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderLeftWidth: 4,
    borderLeftColor: '#ccc',
  },
  quoteText: {
    fontStyle: 'italic',
    color: '#444',
  },
  embedBox: {
    marginVertical: 8,
  },
  attachment: {
    color: '#0066cc',
    textDecorationLine: 'underline',
    marginVertical: 8,
  },
  inlineCode: {
    backgroundColor: '#eee',
    fontFamily: 'monospace',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});

export default RenderedEditorJsContent;
