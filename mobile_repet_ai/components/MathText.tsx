import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface MathTextProps {
  content: string;
  fontSize?: number;
  color?: string;
}

export const MathText = ({ content, fontSize = 18, color = '#1e293b' }: MathTextProps) => {
  const [height, setHeight] = useState(fontSize * 2);

  // Конфигурация MathJax: разрешаем одиночные $ как маркеры формул
  const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <script type="text/x-mathjax-config">
          MathJax.Hub.Config({
            messageStyle: "none",
            tex2jax: {
              inlineMath: [['$', '$'], ['\\(', '\\)']],
              displayMath: [['$$', '$$'], ['\\[', '\\]']],
              processEscapes: true
            },
            CommonHTML: { linebreaks: { automatic: true } }
          });
        </script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML"></script>
        <style>
          body {
            font-family: -apple-system, sans-serif;
            font-size: ${fontSize}px;
            color: ${color};
            line-height: 1.5;
            margin: 0;
            padding: 0;
            background-color: transparent;
          }
          #wrapper {
            width: 100%;
            word-wrap: break-word;
          }
        </style>
      </head>
      <body>
        <div id="wrapper">
          ${content}
        </div>
        <script>
          // Функция для передачи высоты обратно в React Native
          function sendHeight() {
            window.ReactNativeWebView.postMessage(
              document.getElementById('wrapper').offsetHeight
            );
          }
          // Вызываем после загрузки и после обработки формул MathJax
          window.onload = sendHeight;
          MathJax.Hub.Queue(sendHeight);
        </script>
      </body>
    </html>
  `;

  return (
    <View style={{ height: height + 10, width: '100%', backgroundColor: 'transparent' }}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        scrollEnabled={false}
        onMessage={(event) => {
          const webViewHeight = Number(event.nativeEvent.data);
          if (webViewHeight > 0) setHeight(webViewHeight);
        }}
        javaScriptEnabled={true}
        style={{ backgroundColor: 'transparent' }}
      />
    </View>
  );
};