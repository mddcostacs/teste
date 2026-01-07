
# 🚀 Publicando seu Boleto Organizer Pro

Este projeto é uma aplicação web estática. Você pode publicá-la gratuitamente em diversas plataformas.

## Opção Recomendada: Vercel

1. **GitHub**: Crie um repositório no GitHub e suba todos os arquivos (`App.tsx`, `index.html`, etc.).
2. **Vercel**: Crie uma conta em [vercel.com](https://vercel.com) e conecte seu GitHub.
3. **Projeto**: Clique em "Add New" -> "Project" e selecione seu repositório.
4. **Configuração Crucial (API KEY)**:
   - Antes de clicar em Deploy, vá na seção **Environment Variables**.
   - Adicione uma variável com:
     - **Key**: `API_KEY`
     - **Value**: Sua chave obtida no Google AI Studio.
5. **Deploy**: Clique em "Deploy". Em 30 segundos, você terá um link `seu-projeto.vercel.app`.

## Como usar como um App no Celular

1. Abra o link gerado no seu celular (Chrome ou Safari).
2. Clique no ícone de **Compartilhar** (Safari) ou no menu de **3 pontos** (Chrome).
3. Selecione **"Adicionar à Tela de Início"**.
4. O sistema agora terá um ícone na sua tela inicial e funcionará sem as barras do navegador!

## Segurança e Dados
- Seus boletos são salvos **apenas no seu navegador** (LocalStorage). 
- Use a função **Exportar Backup** na barra lateral regularmente para baixar um arquivo `.json` com seus dados. 
- Se mudar de celular ou limpar o histórico do navegador, basta usar a função **Importar Backup**.
