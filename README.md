# 🏋️ Prancheta — App para Personal Trainer

App web (PWA) para gestão de alunos, agenda de aulas, frequência, financeiro e fichas de treino.
**Stack:** HTML único + Firebase (Authentication + Firestore) + GitHub Pages.

---

## 1. Criar o projeto no Firebase (≈ 5 min)

1. Acesse **https://console.firebase.google.com** e clique em **Adicionar projeto** (ex: `prancheta`). Pode desativar o Google Analytics.
2. No painel do projeto, clique no ícone **Web `</>`** para registrar um app web (ex: "Prancheta"). **Não** marque Firebase Hosting.
3. Copie o objeto `firebaseConfig` exibido.
4. Abra o **`index.html`** e cole os valores no bloco `FIREBASE_CONFIG` no início do `<script>`:

```js
const FIREBASE_CONFIG = {
  apiKey:            "AIza...",
  authDomain:        "prancheta-xxxx.firebaseapp.com",
  projectId:         "prancheta-xxxx",
  storageBucket:     "prancheta-xxxx.appspot.com",
  messagingSenderId: "1234567890",
  appId:             "1:1234567890:web:abc123"
};
```

## 2. Ativar o login (Authentication)

1. No menu lateral: **Criação → Authentication → Vamos começar**.
2. Ative o provedor **E-mail/senha**.
3. Na aba **Usuários → Adicionar usuário**, crie o seu login (e-mail + senha). É com ele que você entra no app.

## 3. Ativar o banco de dados (Firestore)

1. Menu lateral: **Criação → Firestore Database → Criar banco de dados**.
2. Escolha o local (ex: `southamerica-east1` — São Paulo) e **modo de produção**.
3. Na aba **Regras**, substitua tudo por:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Clique em **Publicar**.

> Essas regras permitem acesso apenas a usuários logados — ou seja, só você.
> Na **Fase 2** (área do aluno), refinaremos as regras para cada aluno ver apenas os próprios dados.

## 4. Publicar no GitHub Pages

1. Crie um repositório no GitHub (ex: `prancheta`) e envie **todos os arquivos** desta pasta:
   `index.html`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`, `README.md`.
2. No repositório: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / root → Save**.
3. Em ~1 minuto o site estará em `https://SEU-USUARIO.github.io/prancheta/`.

### 4.1 Autorizar o domínio no Firebase

Em **Authentication → Settings → Domínios autorizados**, adicione `SEU-USUARIO.github.io`.
(Sem isso, o login falha quando o app roda no GitHub Pages.)

## 5. Instalar como app no celular (PWA)

- **Android (Chrome):** abra o site → toque no botão **⬇️** no topo do app (ou menu ⋮ → *Instalar app*).
- **iPhone/iPad (Safari):** botão **Compartilhar (□↑)** → **Adicionar à Tela de Início**.

O app abre em tela cheia, com ícone próprio, e o "casco" funciona mesmo offline (os dados sincronizam quando a conexão volta — o Firestore tem cache offline ativado).

---

## Estrutura de dados (Firestore)

| Coleção      | Documento                          | Campos principais |
|--------------|------------------------------------|-------------------|
| `alunos`     | id automático                      | nome, telefone, email, plano, valorMensal, diaVencimento, horarios[{dia,hora}], obs, ativo |
| `presencas`  | `{alunoId}_{data}_{hora}`          | alunoId, data, hora, status (presente/falta), avulsa |
| `pagamentos` | `{alunoId}_{YYYY-MM}`              | alunoId, competencia, valor, status (pago/pendente), pagoEm |
| `fichas`     | id automático                      | nome, alunoId (null = modelo), exercicios[{nome,series,reps,carga,obs}], versao, ativo |

**Versionamento de fichas:** ao editar a ficha de um aluno, o app salva uma **nova versão** e move a anterior para o histórico — é assim que a evolução do treino fica registrada.

## Fase 2 (planejada): Área do Aluno

A base já está pronta para isso: cada aluno ganhará um usuário no Firebase Auth, um campo `uid` no documento do aluno, e regras do Firestore permitindo que ele leia apenas as próprias fichas e presenças.
