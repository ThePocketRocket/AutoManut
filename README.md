# 📱 Aprendendo React Native com Expo

Bem-vindo ao projeto base de aprendizado em React Native! Este aplicativo foi construído usando o [Expo](https://expo.dev/) (SDK 54) e o moderno sistema de navegação [Expo Router](https://docs.expo.dev/router/introduction).

Atualmente, o projeto contém um fluxo inicial muito simples, ideal para estudar os fundamentos do framework:
- **Tela de Login** (`src/app/index.tsx`)
- **Tela Home** (`src/app/home.tsx`)

---

## 🚀 Como rodar o projeto

Siga o passo a passo abaixo para testar o aplicativo no seu próprio celular.

### 1. Instale as dependências
Abra o terminal na pasta raiz do projeto e execute:
```bash
npm install
```
*(Caso encontre algum aviso de "peer dependency" com o React no futuro, você pode usar `npm install --legacy-peer-deps`)*

### 2. Inicie o Servidor do Expo
Ainda no terminal, rode o comando:
```bash
npx expo start
```
Isso vai gerar um **QR Code** no terminal e também abrirá uma interface no seu navegador.

### 3. Abra no celular (usando o Expo Go)
- **No Android:** Baixe o app [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent) na Play Store. Abra o aplicativo e selecione "Scan QR Code". Escaneie o QR Code do terminal.
- **No iOS:** Abra a Câmera nativa do seu iPhone, aponte para o QR Code e toque na notificação amarela do Expo que vai aparecer.

Pronto! Qualquer alteração que você fizer no código será atualizada quase instantaneamente na tela do seu celular.

---

## 📂 Estrutura de Pastas (Para onde olhar)

Se você quer modificar ou entender como o aplicativo funciona, o coração dele está na pasta **`src/app`**:

* `src/app/_layout.tsx`: Gerencia as configurações globais de navegação (O "Stack" de telas).
* `src/app/index.tsx`: É a tela principal que é carregada primeiro (nossa tela de Login).
* `src/app/home.tsx`: É a nossa segunda tela (a Home pós-login).

---

## 📚 Links Úteis para o Futuro

À medida que você for evoluindo (médio a longo prazo), estes links serão essenciais:

- [Documentação Oficial do Expo](https://docs.expo.dev/)
- [Como funciona o Expo Router (Navegação)](https://docs.expo.dev/router/introduction/)
- [Componentes básicos do React Native (View, Text, etc)](https://reactnative.dev/docs/components-and-apis)
- [Usando ESLint e Prettier para padronizar seu código](https://docs.expo.dev/guides/using-eslint/)

Divirta-se aprendendo e construindo seu app! 🎉
