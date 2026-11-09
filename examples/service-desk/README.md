# Balcão de pedidos / Order desk

Uma aplicação de demonstração para concluir o [tutorial de primeira conexão](https://klederson.github.io/relayers-bridge/tutorials/pt-br/primeira-conexao.html): receber uma mensagem autorizada do WhatsApp e escrever uma resposta.

## Abrir

1. Instale **Node.js 22 ou superior** pelo [site oficial](https://nodejs.org/en/download). Se já usa uma versão compatível, continue.
2. Extraia o pacote inteiro. Abra `Open-Windows.cmd` no Windows, `Open-macOS.command` no macOS ou execute `Open-Linux.sh` no Linux. Se o sistema bloquear a abertura, consulte a identificação do arquivo e as opções de execução do seu sistema. Também é possível abrir a pasta em um terminal e executar `node server.mjs`.
3. Mantenha a janela do programa aberta. O balcão abre em `http://127.0.0.1:47831`.
4. Clique em **Conectar minha conta RELAYERS**. Aprove na página oficial com a **mesma conta usada na extensão**.
5. Crie a conexão na extensão para uma conversa de teste, com os dois sentidos permitidos. Deixe os filtros básicos vazios neste primeiro teste.
6. Na extensão, escolha **Computador vinculado**, use o endereço fornecido pelo balcão e selecione o dispositivo com exatamente o nome mostrado no bloco 01 do balcão. Salve; se editar uma conexão existente, clique em **Retomar**.
7. Copie **IN**, **OUT** e a **chave OUT** de “Detalhes da integração” da extensão para os três campos do balcão. Clique em **Conectar os dois caminhos**.
8. Peça ao contato autorizado que envie uma mensagem **nova**. Ela aparece no balcão. Escreva a resposta, clique em **Enviar resposta pelo WhatsApp** e confira a conversa.

O balcão pode rodar em outro computador: autorize-o na mesma conta e escolha o dispositivo correspondente na extensão. Seu endereço de recebimento aponta para o balcão no computador escolhido. O computador com a sessão do WhatsApp e o Bridge também continua disponível.

## Dados e limites

Este é um exemplo para um teste acompanhado; não é uma central de atendimento para produção. Não há envio automático. A aplicação mantém até 50 mensagens, 500 identificadores recebidos e 100 solicitações de envio por execução. Histórico, credenciais e chaves ficam em memória; fechar o programa apaga os dados. O programa só escuta no endereço de loopback e não abre portas na rede local. Não exponha essa interface na internet.

A aplicação usa a aprovação oficial por dispositivo e cria seu próprio dispositivo RELAYERS. Ela não recebe sua senha. Só aceita eventos assinados do caminho IN selecionado e não encaminha pedidos para endereços arbitrários. As respostas usam a chave OUT, o vínculo da mensagem recebida, uma identidade estável e validade de cinco minutos. Não repete uma resposta automaticamente. Em resultado incerto, confira o WhatsApp antes de decidir se envia outra mensagem. “Recebido pelo RELAYERS” não confirma envio; “aceito pelo Bridge” não confirma entrega ou leitura pelo destinatário.

**Desconectar e apagar dados locais** encerra o dispositivo deste balcão. Pause ou remova o destino na extensão quando terminar. O `wire.mjs` é reutilizado do código público deste repositório, sob MIT.

# English

Install **Node.js 22 or newer** from the [official website](https://nodejs.org/en/download), extract the entire archive and open the launcher for your operating system. Keep the program window open; the desk opens at `http://127.0.0.1:47831`. You can also run `node server.mjs` from this folder.

Choose English in the desk. Approve its device using the same RELAYERS account as Bridge. Create a two-way Bridge connection scoped to a test participant; leave Basic filters empty for the first test. In Bridge, choose **Linked computer**, the receiving address shown by the desk and the device with the exact name shown in desk block 01. Save and resume if editing an existing connection. Copy the IN/OUT addresses and OUT key from Bridge into the desk. Ask the participant to send a new message, reply in the desk and check the actual WhatsApp conversation.

This accompanied demonstration is not a production help desk. It holds history and credentials only in memory, listens only on loopback and never sends automatically. An uncertain result must be checked in WhatsApp before another reply. RELAYERS ingestion, Bridge acceptance, recipient delivery and reading are different outcomes. Disconnect the desk and pause its route in Bridge after the test.
