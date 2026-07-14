# Painel administrativo do Vivendo a Obra Nova

Este pacote foi preparado para o repositório `Alessandrosh82/blog` e funciona somente com GitHub/GitHub Pages.

## Funcionalidades

- adicionar artigos;
- editar artigos;
- excluir artigos;
- alterar as cores gerais do site;
- alterar a fonte dos textos;
- alterar a fonte do título;
- pré-visualizar a aparência antes de salvar;
- guardar o token apenas no navegador escolhido;
- registrar cada alteração como commit no GitHub.

## Preservação da aparência

Os valores iniciais de `site-config.json` são exatamente as cores e fontes já usadas no site. A página pública recebeu somente variáveis de configuração com esses mesmos valores. Portanto, após o envio dos arquivos, a aparência permanece igual.

## Endereço do painel

Depois da publicação no GitHub Pages:

`https://www.vivendoaobranova.com.br/admin/`

## Segurança

O token não está em nenhum arquivo do pacote. Ele é informado diretamente no painel e salvo no `localStorage` do navegador somente quando a opção “Manter acesso neste dispositivo” estiver marcada.

Use o painel apenas em dispositivo pessoal. Para remover o acesso salvo, clique em **Sair** dentro do painel ou apague os dados do site no navegador.
