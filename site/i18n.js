// Plain-language website copy. English is primary; all five languages are complete.
export const locales = ["en","pt","es","id","hi"];
export const messages = {
  "en": {
    "skip": "Skip to content",
    "language": "Language",
    "navHow": "How it works",
    "navFeatures": "What it does",
    "navFaq": "FAQ",
    "eyebrow": "A BROWSER EXTENSION YOU CONTROL",
    "heroTitle": "WhatsApp messages.",
    "heroAccent": "Receive. Send.",
    "heroLead": "RELAYERS can send messages through your open WhatsApp. Messages you receive in the chats you choose can also go to RELAYERS. You decide what is allowed.",
    "inOneLine": "Take the messages you receive to RELAYERS.",
    "outOneLine": "Let RELAYERS send messages through WhatsApp.",
    "tryFirefox": "Try it on Firefox",
    "seeDemo": "See both directions",
    "heroNote": "A test version. Keep your browser and WhatsApp open. It is not in the browser stores yet.",
    "visualLabel": "YOUR WHATSAPP, CONNECTED",
    "illustration": "EXAMPLE",
    "sampleContact": "Bia · Bakery",
    "sampleScope": "A chat you chose",
    "sampleQuestion": "Hi! Is my order ready?",
    "sampleAnswer": "Ready for pickup. See you soon!",
    "documentKept": "WhatsApp stays open. No reload.",
    "workflowsLabel": "Choose what happens next.",
    "visualCaption": "You choose the chats. You allow receiving, sending, or both. It starts turned off.",
    "proofSource": "See how it is made",
    "proofScope": "You choose what is allowed",
    "proofTab": "Your WhatsApp stays open",
    "howEyebrow": "01 / MESSAGES GO BOTH WAYS.",
    "howTitle": "What arrives in WhatsApp can go to RELAYERS.\nRELAYERS can send back through WhatsApp.",
    "howLead": "Turn on receiving, sending, or both. Nothing starts until you choose the chats and give permission.",
    "incomingLabel": "WHAT YOU RECEIVE",
    "outgoingLabel": "WHAT YOU SEND",
    "inTitle": "A message arrives.\nRELAYERS can receive it too.",
    "outTitle": "RELAYERS asks to send.\nYour open WhatsApp sends it.",
    "inDescription": "Someone sends you a new message. If it is in a chat you allowed, the extension can take its text to RELAYERS.",
    "outDescription": "Your program can ask RELAYERS to send a message, even from somewhere else. The extension receives that request and sends through the WhatsApp already open on your computer.",
    "exampleLabel": "AN EXAMPLE YOU CAN SET UP",
    "inExample": "A customer asks for help. The message can arrive in RELAYERS and be passed to the service you choose.",
    "outExample": "An order is ready. Your program asks to send “Your order is ready for pickup” to the customer’s allowed chat.",
    "inLimit": "Only new messages in the chats you choose. It does not fetch your whole history or download files.",
    "outLimit": "Once you allow it, you do not need to press Send each time. A send being accepted does not prove the person received or read it.",
    "routeNote": "The extension connects the two sides. You choose and set up what RELAYERS should do with the messages.",
    "demoEyebrow": "02 / LESS “HOW?”, MORE “OH.”",
    "demoTitle": "See a message arrive.\nThen ask for a reply.",
    "demoLead": "This is just an example. It does not read your chats or send any real messages.",
    "demoScope": "Only this example chat is allowed",
    "simulation": "EXAMPLE",
    "demoConsent": "You allow receiving and sending separately. This choice only changes the example.",
    "repeatCommand": "Ask for the same send again",
    "demoOnly": "EXAMPLE ONLY",
    "demoPreserved": "When sending in the background, your current chat and unfinished text stay as they are.",
    "demoFact1": "Receive messages.",
    "demoFact1Body": "What arrives in your chosen chats can go to RELAYERS.",
    "demoFact2": "Ask for a send.",
    "demoFact2Body": "RELAYERS can send through the WhatsApp you allowed.",
    "demoFact3": "Keep control.",
    "demoFact3Body": "Pause, check what happened, or disconnect.",
    "featuresEyebrow": "03 / ALSO VERY GOOD AT THE EVERYDAY STUFF.",
    "featuresTitle": "The little icon\ndoes a lot of lifting.",
    "featuresLead": "You can use these everyday features without connecting RELAYERS. They are already part of the extension.",
    "controlEyebrow": "04 / YOU DECIDE WHAT HAPPENS.",
    "controlTitle": "Your WhatsApp.\nYour choices.\nYour stop button.",
    "controlLead": "Connecting RELAYERS does not turn anything on by itself. First choose the chats. Then say whether it may receive, send, or do both.",
    "privacyLink": "Understand what happens to your data",
    "installEyebrow": "05 / TRY IT WITH SOMEONE YOU KNOW.",
    "installTitle": "Keep WhatsApp open.\nAdd the extension.",
    "installLead": "This is still a test version. Installation has a few extra steps for now. Pick your browser below.",
    "downloadBuild": "Download the test version",
    "statusLabel": "STILL BEING TESTED",
    "statusTitle": "Ready to try.\nStill a test version.",
    "statusRelayers": "The connection to RELAYERS was tested",
    "statusRelayersBody": "RELAYERS exchanged messages with a test imitation of WhatsApp. Receiving, sending and avoiding the same send twice worked in those tests.",
    "statusWhatsapp": "A real WhatsApp account still needs a test",
    "statusWhatsappBody": "Those tests did not use a real WhatsApp account. We still need to check it with WhatsApp open and signed in.",
    "statusFooter": "Keep the computer, browser and WhatsApp available. Do not rely on this test version to work on its own all the time.",
    "faqEyebrow": "06 / THE QUESTIONS THAT MATTER.",
    "faqTitle": "Crystal clear?\nLet’s make sure.",
    "finalEyebrow": "WHATSAPP ↔ RELAYERS",
    "finalTitle": "Your WhatsApp is already open.\nLet RELAYERS lend a hand.",
    "finalLead": "Receive messages. Send messages. Choose the chats and give permission.",
    "sponsor": "Support the project",
    "sponsorNote": "Helping through GitHub Sponsors is optional. You do not need to donate to use the features.",
    "footerSummary": "An extension that takes messages between WhatsApp and RELAYERS. Made from the open TabHero project. Anyone can see how it is built.",
    "source": "See the project",
    "privacy": "Your data",
    "protocol": "For the person setting it up",
    "independent": "Independent integration. Not affiliated with or endorsed by WhatsApp or Meta.",
    "sitePrivacy": "Separate, optional statistics for this site and the extension. Your choice.",
    "permissionIn": "Allow receiving in this example",
    "permissionOut": "Allow sending in this example",
    "runIn": "See a message arrive",
    "runOut": "Ask RELAYERS to send",
    "messageIn": "SOMEONE SENT A MESSAGE",
    "messageOut": "A MESSAGE YOUR PROGRAM WANTS TO SEND",
    "waiting": "Nothing is turned on yet.\nGive permission above, then try the example.",
    "blocked": "Nothing was sent.\nYou have not allowed this yet.\n\nThis example does not send real messages.",
    "inResult": "Bia sent a message on WhatsApp.\n\nThe extension took it to RELAYERS.\nYou choose what RELAYERS should do next.\n\nThis was only an example.",
    "outResult": "RELAYERS asked to send a message.\n\nThe extension asked your open WhatsApp to send it to Bia.\n\nYour current chat and unfinished text stayed as they were.\n\nThis was only an example. It does not prove a real person received a message.",
    "duplicateResult": "The same send was requested again.\n\nThe extension saw that it already had a result.\nIt did not send another message.\n\nThis was only an example.",
    "firefoxNote": "This Firefox test installation ends when you restart the browser. While testing Bridge, turn off TabHero in the same browser. Do not remove TabHero if you want to keep its settings.",
    "chromeNote": "Turn off TabHero while trying Bridge in the same browser. Keep your existing WhatsApp page open as it is.",
    "receiveWord": "Receive",
    "sendWord": "Send",
    "whatHappens": "WHAT HAPPENS",
    "tryChrome": "Try it on Chrome",
    "browserDetected": "Looks like you use {browser}. Its steps are ready below. You can choose another browser.",
    "browserPick": "Choose Firefox or Chrome below. These tests are for a computer.",
    "otherDownloads": "Other downloads",
    "viewDownloads": "View downloads"
  },
  "pt": {
    "skip": "Ir para o conteúdo",
    "language": "Idioma",
    "navHow": "Como funciona",
    "navFeatures": "O que faz",
    "navFaq": "Dúvidas",
    "eyebrow": "UMA EXTENSÃO QUE VOCÊ CONTROLA",
    "heroTitle": "Mensagens do WhatsApp.",
    "heroAccent": "Receba. Envie.",
    "heroLead": "O RELAYERS pode enviar mensagens pelo seu WhatsApp aberto. O que chega nas conversas que você escolher também pode ir para o RELAYERS. Você decide o que permite.",
    "inOneLine": "Leve para o RELAYERS as mensagens que chegam.",
    "outOneLine": "Permita que o RELAYERS envie pelo WhatsApp.",
    "tryFirefox": "Testar no Firefox",
    "seeDemo": "Ver os dois sentidos",
    "heroNote": "É uma versão de teste. Deixe o navegador e o WhatsApp abertos. Ainda não está nas lojas de extensões.",
    "visualLabel": "SEU WHATSAPP, CONECTADO",
    "illustration": "EXEMPLO",
    "sampleContact": "Bia · Padaria",
    "sampleScope": "Uma conversa que você escolheu",
    "sampleQuestion": "Oi! Meu pedido já está pronto?",
    "sampleAnswer": "Pronto para retirar. Até já!",
    "documentKept": "O WhatsApp continua aberto. Sem recarregar.",
    "workflowsLabel": "Escolha o que acontece depois.",
    "visualCaption": "Você escolhe as conversas. Permite receber, enviar ou os dois. Começa desligado.",
    "proofSource": "Você pode ver como é feito",
    "proofScope": "Você escolhe o que permite",
    "proofTab": "Seu WhatsApp continua aberto",
    "howEyebrow": "01 / AS MENSAGENS VÃO E VOLTAM.",
    "howTitle": "O que chega no WhatsApp pode ir para o RELAYERS.\nO RELAYERS pode enviar pelo WhatsApp.",
    "howLead": "Ative o recebimento, o envio ou os dois. Nada começa antes de você escolher as conversas e dar permissão.",
    "incomingLabel": "O QUE VOCÊ RECEBE",
    "outgoingLabel": "O QUE VOCÊ ENVIA",
    "inTitle": "Uma mensagem chega.\nO RELAYERS também pode recebê-la.",
    "outTitle": "O RELAYERS pede para enviar.\nSeu WhatsApp aberto faz o envio.",
    "inDescription": "Alguém manda uma nova mensagem. Se ela chegou em uma conversa que você permitiu, a extensão pode levar o texto para o RELAYERS.",
    "outDescription": "Seu programa pode pedir ao RELAYERS para enviar uma mensagem, mesmo de outro lugar. A extensão recebe esse pedido e envia pelo WhatsApp que já está aberto no seu computador.",
    "exampleLabel": "UM EXEMPLO QUE VOCÊ PODE CONFIGURAR",
    "inExample": "Um cliente pede ajuda. A mensagem pode chegar ao RELAYERS e ser encaminhada ao serviço que você escolher.",
    "outExample": "Um pedido fica pronto. Seu programa pede o envio de “Seu pedido está pronto para retirar” à conversa autorizada do cliente.",
    "inLimit": "Só mensagens novas nas conversas que você escolher. Não busca todo o histórico nem baixa arquivos.",
    "outLimit": "Depois que você permitir, não precisa clicar em Enviar toda vez. O pedido de envio ser aceito não prova que a pessoa recebeu ou leu.",
    "routeNote": "A extensão liga os dois lados. Você escolhe e configura o que o RELAYERS deve fazer com as mensagens.",
    "demoEyebrow": "02 / MENOS “COMO?”, MAIS “AH, ENTENDI”.",
    "demoTitle": "Veja uma mensagem chegar.\nDepois peça uma resposta.",
    "demoLead": "É só um exemplo. Não lê suas conversas nem envia mensagens de verdade.",
    "demoScope": "Só esta conversa do exemplo está permitida",
    "simulation": "EXEMPLO",
    "demoConsent": "Você permite receber e enviar separadamente. Esta escolha só muda o exemplo.",
    "repeatCommand": "Pedir o mesmo envio outra vez",
    "demoOnly": "É SÓ UM EXEMPLO",
    "demoPreserved": "Ao enviar sem trocar de aba, sua conversa atual e o texto que estava escrevendo ficam como estavam.",
    "demoFact1": "Receba mensagens.",
    "demoFact1Body": "O que chega nas conversas escolhidas pode ir para o RELAYERS.",
    "demoFact2": "Peça um envio.",
    "demoFact2Body": "O RELAYERS pode enviar pelo WhatsApp que você autorizou.",
    "demoFact3": "Mantenha o controle.",
    "demoFact3Body": "Pause, confira o que aconteceu ou desconecte.",
    "featuresEyebrow": "03 / TAMBÉM RESOLVE O BÁSICO MUITO BEM.",
    "featuresTitle": "Um ícone pequeno.\nUma baita ajuda.",
    "featuresLead": "Você pode usar estas funções do dia a dia sem conectar o RELAYERS. Elas já fazem parte da extensão.",
    "controlEyebrow": "04 / VOCÊ DECIDE O QUE ACONTECE.",
    "controlTitle": "Seu WhatsApp.\nSuas escolhas.\nSeu botão de parar.",
    "controlLead": "Conectar o RELAYERS não liga nada sozinho. Primeiro escolha as conversas. Depois diga se pode receber, enviar ou fazer os dois.",
    "privacyLink": "Entenda o que acontece com seus dados",
    "installEyebrow": "05 / TESTE COM ALGUÉM QUE COMBINOU COM VOCÊ.",
    "installTitle": "Deixe o WhatsApp aberto.\nAdicione a extensão.",
    "installLead": "Ainda é uma versão de teste. Por enquanto, a instalação tem alguns passos extras. Escolha seu navegador abaixo.",
    "downloadBuild": "Baixar a versão de teste",
    "statusLabel": "AINDA ESTAMOS TESTANDO",
    "statusTitle": "Pronta para experimentar.\nAinda é uma versão de teste.",
    "statusRelayers": "A ligação com o RELAYERS foi testada",
    "statusRelayersBody": "O RELAYERS trocou mensagens com uma imitação do WhatsApp usada para testes. Receber, enviar e evitar o mesmo envio duas vezes funcionaram nesses testes.",
    "statusWhatsapp": "Falta testar com uma conta real do WhatsApp",
    "statusWhatsappBody": "Esses testes não usaram uma conta real do WhatsApp. Ainda precisamos conferir com o WhatsApp aberto e conectado de verdade.",
    "statusFooter": "Mantenha o computador, o navegador e o WhatsApp disponíveis. Não conte com esta versão de teste para trabalhar sozinha o tempo todo.",
    "faqEyebrow": "06 / AS PERGUNTAS QUE IMPORTAM.",
    "faqTitle": "Ficou claro?\nVamos garantir.",
    "finalEyebrow": "WHATSAPP ↔ RELAYERS",
    "finalTitle": "Seu WhatsApp já está aberto.\nDeixe o RELAYERS dar uma mão.",
    "finalLead": "Receba mensagens. Envie mensagens. Escolha as conversas e dê permissão.",
    "sponsor": "Apoiar o projeto",
    "sponsorNote": "Ajudar pelo GitHub Sponsors é opcional. Você não precisa doar para usar os recursos.",
    "footerSummary": "Uma extensão que leva mensagens entre o WhatsApp e o RELAYERS. Feita a partir do projeto aberto TabHero. Qualquer pessoa pode ver como ela foi construída.",
    "source": "Ver o projeto",
    "privacy": "Seus dados",
    "protocol": "Para quem vai configurar",
    "independent": "Integração independente. Sem vínculo ou endosso do WhatsApp ou da Meta.",
    "sitePrivacy": "Estatísticas opcionais e separadas para o site e a extensão. Você escolhe.",
    "permissionIn": "Permitir receber neste exemplo",
    "permissionOut": "Permitir enviar neste exemplo",
    "runIn": "Ver uma mensagem chegar",
    "runOut": "Pedir ao RELAYERS para enviar",
    "messageIn": "ALGUÉM MANDOU UMA MENSAGEM",
    "messageOut": "UMA MENSAGEM QUE SEU PROGRAMA QUER ENVIAR",
    "waiting": "Ainda está tudo desligado.\nDê permissão acima e experimente o exemplo.",
    "blocked": "Nada foi enviado.\nVocê ainda não permitiu isso.\n\nEste exemplo não envia mensagens de verdade.",
    "inResult": "Bia mandou uma mensagem no WhatsApp.\n\nA extensão levou a mensagem para o RELAYERS.\nVocê escolhe o que o RELAYERS faz depois.\n\nIsso foi só um exemplo.",
    "outResult": "O RELAYERS pediu para enviar uma mensagem.\n\nA extensão pediu ao seu WhatsApp aberto para enviar à Bia.\n\nSua conversa atual e o texto que estava escrevendo ficaram como estavam.\n\nIsso foi só um exemplo. Não comprova que alguém recebeu uma mensagem real.",
    "duplicateResult": "Pediram o mesmo envio outra vez.\n\nA extensão viu que já tinha uma resposta para esse pedido.\nNão enviou outra mensagem.\n\nIsso foi só um exemplo.",
    "firefoxNote": "Esta instalação de teste no Firefox termina ao reiniciar o navegador. Durante o teste da Bridge, desligue o TabHero no mesmo navegador. Não remova o TabHero se quiser manter as configurações dele.",
    "chromeNote": "Desligue o TabHero enquanto testa a Bridge no mesmo navegador. Deixe a página atual do WhatsApp aberta como está.",
    "receiveWord": "Receber",
    "sendWord": "Enviar",
    "whatHappens": "O QUE ACONTECE",
    "tryChrome": "Testar no Chrome",
    "browserDetected": "Parece que você usa {browser}. Os passos dele já estão selecionados abaixo. Você pode trocar de navegador.",
    "browserPick": "Escolha Firefox ou Chrome abaixo. Estes testes são para usar no computador.",
    "otherDownloads": "Outros downloads",
    "viewDownloads": "Ver downloads"
  },
  "es": {
    "skip": "Ir al contenido",
    "language": "Idioma",
    "navHow": "Cómo funciona",
    "navFeatures": "Qué hace",
    "navFaq": "Preguntas",
    "eyebrow": "UNA EXTENSIÓN QUE TÚ CONTROLAS",
    "heroTitle": "Mensajes de WhatsApp.",
    "heroAccent": "Recibe. Envía.",
    "heroLead": "RELAYERS puede enviar mensajes por tu WhatsApp abierto. Lo que recibes en los chats que elijas también puede ir a RELAYERS. Tú decides qué permites.",
    "inOneLine": "Lleva a RELAYERS los mensajes que recibes.",
    "outOneLine": "Permite que RELAYERS envíe por WhatsApp.",
    "tryFirefox": "Probar en Firefox",
    "seeDemo": "Ver ambos sentidos",
    "heroNote": "Es una versión de prueba. Deja abiertos el navegador y WhatsApp. Aún no está en las tiendas de extensiones.",
    "visualLabel": "TU WHATSAPP, CONECTADO",
    "illustration": "EJEMPLO",
    "sampleContact": "Bia · Panadería",
    "sampleScope": "Un chat que elegiste",
    "sampleQuestion": "¡Hola! ¿Mi pedido ya está listo?",
    "sampleAnswer": "Listo para recoger. ¡Hasta pronto!",
    "documentKept": "WhatsApp sigue abierto. Sin recargar.",
    "workflowsLabel": "Elige qué pasa después.",
    "visualCaption": "Eliges los chats. Permites recibir, enviar o ambos. Empieza apagado.",
    "proofSource": "Puedes ver cómo está hecho",
    "proofScope": "Tú eliges qué permites",
    "proofTab": "Tu WhatsApp sigue abierto",
    "howEyebrow": "01 / LOS MENSAJES VAN Y VIENEN.",
    "howTitle": "Lo que llega a WhatsApp puede ir a RELAYERS.\nRELAYERS puede enviar por WhatsApp.",
    "howLead": "Activa recibir, enviar o ambos. Nada empieza hasta que elijas los chats y des permiso.",
    "incomingLabel": "LO QUE RECIBES",
    "outgoingLabel": "LO QUE ENVÍAS",
    "inTitle": "Llega un mensaje.\nRELAYERS también puede recibirlo.",
    "outTitle": "RELAYERS pide enviar.\nTu WhatsApp abierto lo envía.",
    "inDescription": "Alguien te manda un mensaje nuevo. Si llega a un chat permitido, la extensión puede llevar el texto a RELAYERS.",
    "outDescription": "Tu programa puede pedir a RELAYERS que envíe un mensaje, incluso desde otro lugar. La extensión recibe la petición y envía por el WhatsApp abierto en tu ordenador.",
    "exampleLabel": "UN EJEMPLO QUE PUEDES PREPARAR",
    "inExample": "Un cliente pide ayuda. El mensaje puede llegar a RELAYERS y pasar al servicio que elijas.",
    "outExample": "Un pedido está listo. Tu programa pide enviar “Tu pedido está listo para recoger” al chat permitido del cliente.",
    "inLimit": "Solo mensajes nuevos en los chats que elijas. No busca todo el historial ni descarga archivos.",
    "outLimit": "Una vez que lo permites, no necesitas pulsar Enviar cada vez. Que se acepte el envío no prueba que la persona lo recibió o leyó.",
    "routeNote": "La extensión une los dos lados. Tú eliges y preparas lo que RELAYERS debe hacer con los mensajes.",
    "demoEyebrow": "02 / MENOS “¿CÓMO?”, MÁS “AH, YA”.",
    "demoTitle": "Mira cómo llega un mensaje.\nDespués pide una respuesta.",
    "demoLead": "Es solo un ejemplo. No lee tus chats ni envía mensajes de verdad.",
    "demoScope": "Solo este chat del ejemplo está permitido",
    "simulation": "EJEMPLO",
    "demoConsent": "Permites recibir y enviar por separado. Esta elección solo cambia el ejemplo.",
    "repeatCommand": "Pedir el mismo envío otra vez",
    "demoOnly": "SOLO UN EJEMPLO",
    "demoPreserved": "Al enviar sin cambiar de pestaña, tu chat actual y el texto que escribías quedan igual.",
    "demoFact1": "Recibe mensajes.",
    "demoFact1Body": "Lo que llega a los chats elegidos puede ir a RELAYERS.",
    "demoFact2": "Pide un envío.",
    "demoFact2Body": "RELAYERS puede enviar por el WhatsApp que autorizaste.",
    "demoFact3": "Mantén el control.",
    "demoFact3Body": "Pausa, revisa qué pasó o desconecta.",
    "featuresEyebrow": "03 / TAMBIÉN RESUELVE LO COTIDIANO.",
    "featuresTitle": "Un icono pequeño.\nUna gran ayuda.",
    "featuresLead": "Puedes usar estas funciones diarias sin conectar RELAYERS. Ya vienen en la extensión.",
    "controlEyebrow": "04 / TÚ DECIDES QUÉ PASA.",
    "controlTitle": "Tu WhatsApp.\nTus decisiones.\nTu botón de parar.",
    "controlLead": "Conectar RELAYERS no activa nada por sí solo. Primero elige los chats. Después permite recibir, enviar o ambos.",
    "privacyLink": "Entiende qué pasa con tus datos",
    "installEyebrow": "05 / PRUÉBALO CON ALGUIEN QUE CONOZCAS.",
    "installTitle": "Deja WhatsApp abierto.\nAñade la extensión.",
    "installLead": "Todavía es una versión de prueba. Por ahora, instalar requiere unos pasos extra. Elige tu navegador abajo.",
    "downloadBuild": "Descargar la versión de prueba",
    "statusLabel": "SEGUIMOS PROBANDO",
    "statusTitle": "Lista para probar.\nAún es una versión de prueba.",
    "statusRelayers": "La conexión con RELAYERS fue probada",
    "statusRelayersBody": "RELAYERS intercambió mensajes con una imitación de WhatsApp para pruebas. Recibir, enviar y evitar el mismo envío dos veces funcionaron en esas pruebas.",
    "statusWhatsapp": "Falta probar con una cuenta real de WhatsApp",
    "statusWhatsappBody": "Esas pruebas no usaron una cuenta real de WhatsApp. Todavía falta comprobarlo con WhatsApp abierto y conectado de verdad.",
    "statusFooter": "Mantén disponibles el ordenador, el navegador y WhatsApp. No dependas de esta versión de prueba para trabajar sola todo el tiempo.",
    "faqEyebrow": "06 / LAS PREGUNTAS QUE IMPORTAN.",
    "faqTitle": "¿Todo claro?\nVamos a comprobarlo.",
    "finalEyebrow": "WHATSAPP ↔ RELAYERS",
    "finalTitle": "Tu WhatsApp ya está abierto.\nDeja que RELAYERS te ayude.",
    "finalLead": "Recibe mensajes. Envía mensajes. Elige los chats y da permiso.",
    "sponsor": "Apoyar el proyecto",
    "sponsorNote": "Ayudar por GitHub Sponsors es opcional. No necesitas donar para usar las funciones.",
    "footerSummary": "Una extensión que lleva mensajes entre WhatsApp y RELAYERS. Hecha a partir del proyecto abierto TabHero. Cualquiera puede ver cómo se construyó.",
    "source": "Ver el proyecto",
    "privacy": "Tus datos",
    "protocol": "Para quien lo vaya a configurar",
    "independent": "Integración independiente. Sin afiliación ni respaldo de WhatsApp o Meta.",
    "sitePrivacy": "Estadísticas opcionales e independientes para el sitio y la extensión. Tú eliges.",
    "permissionIn": "Permitir recibir en este ejemplo",
    "permissionOut": "Permitir enviar en este ejemplo",
    "runIn": "Ver llegar un mensaje",
    "runOut": "Pedir a RELAYERS que envíe",
    "messageIn": "ALGUIEN MANDÓ UN MENSAJE",
    "messageOut": "UN MENSAJE QUE TU PROGRAMA QUIERE ENVIAR",
    "waiting": "Todavía está todo apagado.\nDa permiso arriba y prueba el ejemplo.",
    "blocked": "No se envió nada.\nTodavía no lo has permitido.\n\nEste ejemplo no envía mensajes de verdad.",
    "inResult": "Bia mandó un mensaje por WhatsApp.\n\nLa extensión lo llevó a RELAYERS.\nTú eliges qué hace RELAYERS después.\n\nEsto fue solo un ejemplo.",
    "outResult": "RELAYERS pidió enviar un mensaje.\n\nLa extensión pidió a tu WhatsApp abierto que lo enviara a Bia.\n\nTu chat actual y el texto que escribías quedaron igual.\n\nFue solo un ejemplo. No prueba que alguien recibió un mensaje real.",
    "duplicateResult": "Se pidió el mismo envío otra vez.\n\nLa extensión vio que ya tenía un resultado.\nNo envió otro mensaje.\n\nFue solo un ejemplo.",
    "firefoxNote": "Esta instalación de prueba en Firefox termina al reiniciar el navegador. Mientras pruebas Bridge, apaga TabHero en el mismo navegador. No lo elimines si quieres conservar sus ajustes.",
    "chromeNote": "Apaga TabHero mientras pruebas Bridge en el mismo navegador. Deja la página actual de WhatsApp abierta como está.",
    "receiveWord": "Recibir",
    "sendWord": "Enviar",
    "whatHappens": "QUÉ PASA",
    "tryChrome": "Probar en Chrome",
    "browserDetected": "Parece que usas {browser}. Sus pasos ya están seleccionados abajo. Puedes elegir otro navegador.",
    "browserPick": "Elige Firefox o Chrome abajo. Estas pruebas son para un ordenador.",
    "otherDownloads": "Otras descargas",
    "viewDownloads": "Ver descargas"
  },
  "id": {
    "skip": "Ke konten",
    "language": "Bahasa",
    "navHow": "Cara kerja",
    "navFeatures": "Apa fungsinya",
    "navFaq": "Tanya jawab",
    "eyebrow": "EKSTENSI YANG ANDA KENDALIKAN",
    "heroTitle": "Pesan WhatsApp.",
    "heroAccent": "Terima. Kirim.",
    "heroLead": "RELAYERS bisa mengirim pesan lewat WhatsApp yang terbuka. Pesan masuk di obrolan pilihan Anda juga bisa dikirim ke RELAYERS. Anda yang memberi izin.",
    "inOneLine": "Bawa pesan yang masuk ke RELAYERS.",
    "outOneLine": "Izinkan RELAYERS mengirim lewat WhatsApp.",
    "tryFirefox": "Coba di Firefox",
    "seeDemo": "Lihat kedua arah",
    "heroNote": "Ini versi uji. Biarkan browser dan WhatsApp terbuka. Belum tersedia di toko ekstensi.",
    "visualLabel": "WHATSAPP ANDA, TERHUBUNG",
    "illustration": "CONTOH",
    "sampleContact": "Bia · Toko roti",
    "sampleScope": "Obrolan yang Anda pilih",
    "sampleQuestion": "Halo! Pesanan saya sudah siap?",
    "sampleAnswer": "Siap diambil. Sampai jumpa!",
    "documentKept": "WhatsApp tetap terbuka. Tanpa memuat ulang.",
    "workflowsLabel": "Pilih apa yang terjadi berikutnya.",
    "visualCaption": "Anda memilih obrolan. Izinkan menerima, mengirim, atau keduanya. Awalnya nonaktif.",
    "proofSource": "Lihat cara pembuatannya",
    "proofScope": "Anda memilih izinnya",
    "proofTab": "WhatsApp Anda tetap terbuka",
    "howEyebrow": "01 / PESAN BISA DUA ARAH.",
    "howTitle": "Yang masuk ke WhatsApp bisa menuju RELAYERS.\nRELAYERS bisa mengirim lewat WhatsApp.",
    "howLead": "Aktifkan menerima, mengirim, atau keduanya. Tidak dimulai sebelum Anda memilih obrolan dan memberi izin.",
    "incomingLabel": "YANG ANDA TERIMA",
    "outgoingLabel": "YANG ANDA KIRIM",
    "inTitle": "Ada pesan masuk.\nRELAYERS juga bisa menerimanya.",
    "outTitle": "RELAYERS meminta pengiriman.\nWhatsApp terbuka Anda mengirimnya.",
    "inDescription": "Seseorang mengirim pesan baru. Jika masuk di obrolan yang Anda izinkan, ekstensi bisa membawa teksnya ke RELAYERS.",
    "outDescription": "Program Anda bisa meminta RELAYERS mengirim pesan, bahkan dari tempat lain. Ekstensi menerima permintaan itu dan mengirim lewat WhatsApp yang terbuka di komputer Anda.",
    "exampleLabel": "CONTOH YANG BISA ANDA ATUR",
    "inExample": "Pelanggan meminta bantuan. Pesannya bisa masuk ke RELAYERS lalu diteruskan ke layanan pilihan Anda.",
    "outExample": "Pesanan siap. Program Anda meminta mengirim “Pesanan Anda siap diambil” ke obrolan pelanggan yang diizinkan.",
    "inLimit": "Hanya pesan baru di obrolan pilihan Anda. Tidak mengambil seluruh riwayat atau mengunduh file.",
    "outLimit": "Setelah diizinkan, Anda tidak perlu menekan Kirim setiap kali. Permintaan diterima bukan bukti orangnya menerima atau membaca.",
    "routeNote": "Ekstensi menghubungkan kedua sisi. Anda memilih dan mengatur apa yang RELAYERS lakukan dengan pesan.",
    "demoEyebrow": "02 / LANGSUNG LIHAT CARANYA.",
    "demoTitle": "Lihat pesan masuk.\nLalu minta balasan.",
    "demoLead": "Ini hanya contoh. Tidak membaca obrolan atau mengirim pesan sungguhan.",
    "demoScope": "Hanya obrolan contoh ini yang diizinkan",
    "simulation": "CONTOH",
    "demoConsent": "Izin menerima dan mengirim terpisah. Pilihan ini hanya mengubah contoh.",
    "repeatCommand": "Minta pengiriman yang sama lagi",
    "demoOnly": "HANYA CONTOH",
    "demoPreserved": "Saat mengirim tanpa berpindah tab, obrolan aktif dan teks yang sedang ditulis tetap sama.",
    "demoFact1": "Terima pesan.",
    "demoFact1Body": "Yang masuk di obrolan pilihan bisa menuju RELAYERS.",
    "demoFact2": "Minta pengiriman.",
    "demoFact2Body": "RELAYERS bisa mengirim lewat WhatsApp yang Anda izinkan.",
    "demoFact3": "Tetap pegang kendali.",
    "demoFact3Body": "Jeda, periksa hasilnya, atau putuskan.",
    "featuresEyebrow": "03 / JUGA MEMUDAHKAN KEGIATAN SEHARI-HARI.",
    "featuresTitle": "Ikon kecil.\nBanyak membantu.",
    "featuresLead": "Fitur sehari-hari ini bisa dipakai tanpa menghubungkan RELAYERS. Sudah termasuk dalam ekstensi.",
    "controlEyebrow": "04 / ANDA MEMUTUSKAN.",
    "controlTitle": "WhatsApp Anda.\nPilihan Anda.\nTombol berhenti Anda.",
    "controlLead": "Menghubungkan RELAYERS tidak langsung menyalakan apa pun. Pilih obrolan dulu. Lalu izinkan menerima, mengirim, atau keduanya.",
    "privacyLink": "Pahami apa yang terjadi pada data Anda",
    "installEyebrow": "05 / COBA DENGAN ORANG YANG ANDA KENAL.",
    "installTitle": "Biarkan WhatsApp terbuka.\nTambahkan ekstensi.",
    "installLead": "Ini masih versi uji. Untuk saat ini, ada beberapa langkah tambahan untuk memasang. Pilih browser Anda di bawah.",
    "downloadBuild": "Unduh versi uji",
    "statusLabel": "MASIH DIUJI",
    "statusTitle": "Siap dicoba.\nMasih versi uji.",
    "statusRelayers": "Koneksi ke RELAYERS sudah diuji",
    "statusRelayersBody": "RELAYERS bertukar pesan dengan tiruan WhatsApp untuk pengujian. Menerima, mengirim, dan mencegah kirim yang sama dua kali berhasil dalam uji itu.",
    "statusWhatsapp": "Masih perlu diuji dengan akun WhatsApp nyata",
    "statusWhatsappBody": "Uji tadi tidak memakai akun WhatsApp nyata. Masih perlu dicek dengan WhatsApp terbuka dan benar-benar login.",
    "statusFooter": "Pastikan komputer, browser, dan WhatsApp tersedia. Jangan andalkan versi uji ini bekerja sendiri sepanjang waktu.",
    "faqEyebrow": "06 / PERTANYAAN PENTING.",
    "faqTitle": "Sudah jelas?\nMari pastikan.",
    "finalEyebrow": "WHATSAPP ↔ RELAYERS",
    "finalTitle": "WhatsApp Anda sudah terbuka.\nBiarkan RELAYERS membantu.",
    "finalLead": "Terima pesan. Kirim pesan. Pilih obrolan dan beri izin.",
    "sponsor": "Dukung proyek ini",
    "sponsorNote": "Mendukung lewat GitHub Sponsors opsional. Tidak perlu donasi untuk memakai fiturnya.",
    "footerSummary": "Ekstensi yang membawa pesan antara WhatsApp dan RELAYERS. Dibuat dari proyek terbuka TabHero. Siapa pun bisa melihat cara pembuatannya.",
    "source": "Lihat proyek",
    "privacy": "Data Anda",
    "protocol": "Untuk yang menyiapkan",
    "independent": "Integrasi independen. Tidak berafiliasi dengan atau didukung WhatsApp maupun Meta.",
    "sitePrivacy": "Statistik opsional terpisah untuk situs dan ekstensi. Anda yang memilih.",
    "permissionIn": "Izinkan menerima pada contoh ini",
    "permissionOut": "Izinkan mengirim pada contoh ini",
    "runIn": "Lihat pesan masuk",
    "runOut": "Minta RELAYERS mengirim",
    "messageIn": "SESEORANG MENGIRIM PESAN",
    "messageOut": "PESAN YANG INGIN DIKIRIM PROGRAM ANDA",
    "waiting": "Semuanya masih nonaktif.\nBeri izin di atas, lalu coba contohnya.",
    "blocked": "Tidak ada yang dikirim.\nAnda belum memberi izin.\n\nContoh ini tidak mengirim pesan sungguhan.",
    "inResult": "Bia mengirim pesan di WhatsApp.\n\nEkstensi membawanya ke RELAYERS.\nAnda memilih apa yang RELAYERS lakukan berikutnya.\n\nIni hanya contoh.",
    "outResult": "RELAYERS meminta pengiriman pesan.\n\nEkstensi meminta WhatsApp terbuka Anda mengirimnya ke Bia.\n\nObrolan aktif dan tulisan yang belum selesai tetap sama.\n\nIni hanya contoh. Bukan bukti seseorang menerima pesan nyata.",
    "duplicateResult": "Pengiriman yang sama diminta lagi.\n\nEkstensi melihat hasilnya sudah ada.\nTidak mengirim pesan lagi.\n\nIni hanya contoh.",
    "firefoxNote": "Instalasi uji Firefox ini berakhir saat browser dimulai ulang. Saat mencoba Bridge, nonaktifkan TabHero di browser yang sama. Jangan hapus TabHero jika ingin menyimpan pengaturannya.",
    "chromeNote": "Nonaktifkan TabHero saat mencoba Bridge di browser yang sama. Biarkan halaman WhatsApp yang ada tetap terbuka seperti sekarang.",
    "receiveWord": "Terima",
    "sendWord": "Kirim",
    "whatHappens": "YANG TERJADI",
    "tryChrome": "Coba di Chrome",
    "browserDetected": "Sepertinya Anda memakai {browser}. Langkahnya sudah dipilih di bawah. Anda bisa memilih browser lain.",
    "browserPick": "Pilih Firefox atau Chrome di bawah. Pengujian ini untuk komputer.",
    "otherDownloads": "Unduhan lainnya",
    "viewDownloads": "Lihat unduhan"
  },
  "hi": {
    "skip": "सामग्री पर जाएँ",
    "language": "भाषा",
    "navHow": "कैसे काम करता है",
    "navFeatures": "यह क्या करता है",
    "navFaq": "सवाल",
    "eyebrow": "एक्सटेंशन आपके नियंत्रण में",
    "heroTitle": "WhatsApp संदेश।",
    "heroAccent": "पाएँ। भेजें।",
    "heroLead": "RELAYERS आपके खुले WhatsApp से संदेश भेज सकता है। आपकी चुनी चैट में आने वाले संदेश भी RELAYERS तक पहुँच सकते हैं। अनुमति आप देते हैं।",
    "inOneLine": "आने वाले संदेश RELAYERS तक पहुँचाएँ।",
    "outOneLine": "RELAYERS को WhatsApp से संदेश भेजने दें।",
    "tryFirefox": "Firefox पर आज़माएँ",
    "seeDemo": "दोनों दिशाएँ देखें",
    "heroNote": "यह टेस्ट संस्करण है। ब्राउज़र और WhatsApp खुले रखें। अभी एक्सटेंशन स्टोर में नहीं है।",
    "visualLabel": "आपका WhatsApp, जुड़ा हुआ",
    "illustration": "उदाहरण",
    "sampleContact": "बिया · बेकरी",
    "sampleScope": "आपकी चुनी चैट",
    "sampleQuestion": "नमस्ते! क्या मेरा ऑर्डर तैयार है?",
    "sampleAnswer": "लेने के लिए तैयार है। जल्द मिलते हैं!",
    "documentKept": "WhatsApp खुला रहता है। रीलोड नहीं होता।",
    "workflowsLabel": "आगे क्या होगा, आप चुनें।",
    "visualCaption": "चैट आप चुनते हैं। पाने, भेजने या दोनों की अनुमति दें। शुरू में बंद रहता है।",
    "proofSource": "देखें इसे कैसे बनाया गया",
    "proofScope": "अनुमति आप चुनते हैं",
    "proofTab": "आपका WhatsApp खुला रहता है",
    "howEyebrow": "01 / संदेश आते भी हैं, जाते भी हैं।",
    "howTitle": "WhatsApp में आने वाले संदेश RELAYERS तक जा सकते हैं।\nRELAYERS WhatsApp से संदेश भेज सकता है।",
    "howLead": "पाना, भेजना या दोनों चालू करें। चैट चुनने और अनुमति देने से पहले कुछ शुरू नहीं होता।",
    "incomingLabel": "जो आपको मिलता है",
    "outgoingLabel": "जो आप भेजते हैं",
    "inTitle": "संदेश आता है।\nRELAYERS भी उसे पा सकता है।",
    "outTitle": "RELAYERS भेजने को कहता है।\nआपका खुला WhatsApp भेजता है।",
    "inDescription": "कोई नया संदेश भेजता है। अगर वह अनुमति वाली चैट में आया है, एक्सटेंशन उसका टेक्स्ट RELAYERS तक पहुँचा सकता है।",
    "outDescription": "आपका प्रोग्राम दूसरी जगह से भी RELAYERS को संदेश भेजने को कह सकता है। एक्सटेंशन अनुरोध पाकर आपके कंप्यूटर पर खुले WhatsApp से भेजता है।",
    "exampleLabel": "एक उदाहरण जिसे आप सेट कर सकते हैं",
    "inExample": "ग्राहक मदद माँगता है। संदेश RELAYERS तक पहुँचकर आपकी चुनी सेवा को दिया जा सकता है।",
    "outExample": "ऑर्डर तैयार है। आपका प्रोग्राम ग्राहक की अनुमति वाली चैट में “आपका ऑर्डर तैयार है” भेजने को कहता है।",
    "inLimit": "सिर्फ चुनी चैट के नए संदेश। पूरा इतिहास नहीं लाता और फ़ाइल डाउनलोड नहीं करता।",
    "outLimit": "अनुमति देने के बाद हर बार भेजें क्लिक नहीं करना पड़ता। भेजने का अनुरोध स्वीकार होना, सामने वाले के पाने या पढ़ने का प्रमाण नहीं है।",
    "routeNote": "एक्सटेंशन दोनों तरफ़ जोड़ता है। संदेशों के साथ RELAYERS को क्या करना है, आप चुनकर सेट करते हैं।",
    "demoEyebrow": "02 / देखकर समझें।",
    "demoTitle": "संदेश आते देखें।\nफिर जवाब माँगें।",
    "demoLead": "यह सिर्फ उदाहरण है। आपकी चैट नहीं पढ़ता, असली संदेश नहीं भेजता।",
    "demoScope": "इस उदाहरण में सिर्फ यही चैट अनुमत है",
    "simulation": "उदाहरण",
    "demoConsent": "पाने और भेजने की अनुमति अलग है। यह चुनाव सिर्फ उदाहरण बदलता है।",
    "repeatCommand": "वही संदेश दोबारा भेजने को कहें",
    "demoOnly": "सिर्फ उदाहरण",
    "demoPreserved": "टैब बदले बिना भेजते समय आपकी खुली चैट और अधूरा टेक्स्ट वैसे ही रहते हैं।",
    "demoFact1": "संदेश पाएँ।",
    "demoFact1Body": "चुनी चैट में आया संदेश RELAYERS तक जा सकता है।",
    "demoFact2": "भेजने को कहें।",
    "demoFact2Body": "RELAYERS आपके अनुमति वाले WhatsApp से भेज सकता है।",
    "demoFact3": "नियंत्रण रखें।",
    "demoFact3Body": "रोकें, देखें क्या हुआ या कनेक्शन हटाएँ।",
    "featuresEyebrow": "03 / रोज़ के काम भी आसान।",
    "featuresTitle": "छोटा आइकन।\nबड़ी मदद।",
    "featuresLead": "इन रोज़ की सुविधाओं के लिए RELAYERS जोड़ना ज़रूरी नहीं। ये एक्सटेंशन में पहले से हैं।",
    "controlEyebrow": "04 / आप तय करते हैं।",
    "controlTitle": "आपका WhatsApp।\nआपके चुनाव।\nरोकने का बटन आपका।",
    "controlLead": "RELAYERS जोड़ने से कुछ अपने आप चालू नहीं होता। पहले चैट चुनें। फिर पाने, भेजने या दोनों की अनुमति दें।",
    "privacyLink": "जानें आपके डेटा का क्या होता है",
    "installEyebrow": "05 / किसी परिचित के साथ आज़माएँ।",
    "installTitle": "WhatsApp खुला रखें।\nएक्सटेंशन जोड़ें।",
    "installLead": "यह अभी टेस्ट संस्करण है। फिलहाल जोड़ने के कुछ अतिरिक्त कदम हैं। नीचे अपना ब्राउज़र चुनें।",
    "downloadBuild": "टेस्ट संस्करण डाउनलोड करें",
    "statusLabel": "जाँच अभी चल रही है",
    "statusTitle": "आज़माने के लिए तैयार।\nअभी टेस्ट संस्करण है।",
    "statusRelayers": "RELAYERS से जुड़ाव जाँचा गया",
    "statusRelayersBody": "RELAYERS ने जाँच वाले नकली WhatsApp से संदेश लिए और भेजे। उन जाँचों में पाना, भेजना और वही संदेश दो बार भेजने से बचना सफल रहा।",
    "statusWhatsapp": "असली WhatsApp खाते से जाँच बाकी है",
    "statusWhatsappBody": "उन जाँचों में असली WhatsApp खाता नहीं था। खुले और लॉगिन वाले असली WhatsApp से जाँच अभी बाकी है।",
    "statusFooter": "कंप्यूटर, ब्राउज़र और WhatsApp उपलब्ध रखें। इस टेस्ट संस्करण पर हर समय अपने आप काम करने का भरोसा न करें।",
    "faqEyebrow": "06 / ज़रूरी सवाल।",
    "faqTitle": "सब स्पष्ट है?\nपक्का कर लें।",
    "finalEyebrow": "WHATSAPP ↔ RELAYERS",
    "finalTitle": "आपका WhatsApp पहले से खुला है।\nRELAYERS को मदद करने दें।",
    "finalLead": "संदेश पाएँ। संदेश भेजें। चैट चुनें और अनुमति दें।",
    "sponsor": "प्रोजेक्ट का सहयोग करें",
    "sponsorNote": "GitHub Sponsors से सहयोग वैकल्पिक है। सुविधाएँ उपयोग करने के लिए दान ज़रूरी नहीं।",
    "footerSummary": "WhatsApp और RELAYERS के बीच संदेश पहुँचाने वाला एक्सटेंशन। खुले TabHero प्रोजेक्ट से बनाया गया। कोई भी देख सकता है इसे कैसे बनाया गया।",
    "source": "प्रोजेक्ट देखें",
    "privacy": "आपका डेटा",
    "protocol": "सेट करने वाले के लिए",
    "independent": "स्वतंत्र इंटीग्रेशन। WhatsApp या Meta से संबद्ध या अनुमोदित नहीं।",
    "sitePrivacy": "साइट और एक्सटेंशन के लिए अलग-अलग वैकल्पिक आँकड़े। आपकी पसंद।",
    "permissionIn": "इस उदाहरण में पाने दें",
    "permissionOut": "इस उदाहरण में भेजने दें",
    "runIn": "संदेश आते देखें",
    "runOut": "RELAYERS से भेजने को कहें",
    "messageIn": "किसी ने संदेश भेजा",
    "messageOut": "संदेश जो आपका प्रोग्राम भेजना चाहता है",
    "waiting": "अभी सब बंद है।\nऊपर अनुमति दें, फिर उदाहरण आज़माएँ।",
    "blocked": "कुछ नहीं भेजा गया।\nआपने अभी अनुमति नहीं दी है।\n\nयह उदाहरण असली संदेश नहीं भेजता।",
    "inResult": "बिया ने WhatsApp पर संदेश भेजा।\n\nएक्सटेंशन उसे RELAYERS तक ले गया।\nआगे RELAYERS क्या करे, आप चुनें।\n\nयह सिर्फ उदाहरण था।",
    "outResult": "RELAYERS ने संदेश भेजने को कहा।\n\nएक्सटेंशन ने आपके खुले WhatsApp से बिया को भेजने का अनुरोध किया।\n\nआपकी खुली चैट और अधूरा टेक्स्ट वैसे ही रहे।\n\nयह सिर्फ उदाहरण है। असली व्यक्ति को संदेश मिलने का प्रमाण नहीं है।",
    "duplicateResult": "उसी संदेश को फिर भेजने को कहा गया।\n\nएक्सटेंशन ने देखा कि उसका परिणाम पहले से है।\nदूसरा संदेश नहीं भेजा।\n\nयह सिर्फ उदाहरण था।",
    "firefoxNote": "Firefox की यह टेस्ट इंस्टॉलेशन रीस्टार्ट पर समाप्त होती है। Bridge जाँचते समय उसी ब्राउज़र में TabHero बंद करें। उसकी सेटिंग बचानी हो तो हटाएँ नहीं।",
    "chromeNote": "उसी ब्राउज़र में Bridge जाँचते समय TabHero बंद करें। मौजूदा WhatsApp पेज जैसा है वैसा खुला रखें।",
    "receiveWord": "पाएँ",
    "sendWord": "भेजें",
    "whatHappens": "क्या होता है",
    "tryChrome": "Chrome पर आज़माएँ",
    "browserDetected": "लगता है आप {browser} उपयोग करते हैं। नीचे उसके कदम चुने गए हैं। आप दूसरा ब्राउज़र चुन सकते हैं।",
    "browserPick": "नीचे Firefox या Chrome चुनें। यह जाँच कंप्यूटर पर करने के लिए है।",
    "otherDownloads": "अन्य डाउनलोड",
    "viewDownloads": "डाउनलोड देखें"
  }
};
export const content = {
  "en": {
    "features": [
      {
        "icon": "↩",
        "title": "Reply without leaving your task",
        "body": "Open the extension, choose the chat, write and press Send. Your WhatsApp does the sending. You stay on the page you were using."
      },
      {
        "icon": "≡",
        "title": "Save the replies you use most",
        "body": "Save a reply once. Next time, choose it, change what you need and send. Less typing, fewer repeated answers to write."
      },
      {
        "icon": "⌕",
        "title": "Find the right chat",
        "body": "Search for the person and read the available message before replying. For photos, audio and files, you may see a short label and an available caption. The extension does not download them."
      },
      {
        "icon": "✧",
        "title": "Ask AI for a suggestion, if you want",
        "body": "Ask for a reply suggestion, read it and decide whether to send. You need your own OpenRouter access key, a code from your account. The text goes to that AI service, which may charge you. Nothing is generated until you ask."
      },
      {
        "icon": "99",
        "title": "See what is still unread",
        "body": "The extension icon shows the unread count it can see in WhatsApp, up to 99+. No extra pop-up notification jumping in front of your work."
      },
      {
        "icon": "↗",
        "title": "A WhatsApp link uses the tab you have",
        "body": "Click a supported WhatsApp chat link. The conversation opens inside the WhatsApp already loaded, without reloading it. If it cannot open the chat that way, it shows an error."
      }
    ],
    "controls": [
      {
        "title": "Choose who is included",
        "body": "Connect one WhatsApp account at a time in this extension. Choose up to 50 chats. It does not run in private browsing. If you reopen WhatsApp, reconnect the same account."
      },
      {
        "title": "Help avoid sending twice",
        "body": "The extension remembers send requests. If the same request arrives again, it checks the result it already has. If it cannot be sure what happened, it tells you to check WhatsApp instead of blindly sending again."
      },
      {
        "title": "Pause or disconnect whenever you want",
        "body": "Pause stops new exchanges and keeps what is waiting to be passed on. Disconnect removes the connection details and waiting messages from this browser. Something already started may still finish."
      },
      {
        "title": "Know where your messages go",
        "body": "To take messages to RELAYERS, the extension needs to read and pass on the chats you allowed. RELAYERS and other services you connect may keep them. Disconnecting here does not erase what was already sent to those services."
      }
    ],
    "faq": [
      {
        "title": "Can RELAYERS send messages through my WhatsApp?",
        "body": "Yes, if you allow sending and choose the chats. Your program can ask RELAYERS to send, even from somewhere else. The extension receives the request and sends through your open WhatsApp. You do not need to click Send every time. Keep the computer, browser and WhatsApp available."
      },
      {
        "title": "Can messages I receive also go to RELAYERS?",
        "body": "Yes. Choose the chats and allow receiving. New incoming messages the extension can see can be taken to RELAYERS. This includes their text, available captions, date and information that identifies the chat and message. You choose what happens in RELAYERS next. Messages sent by your own account are not taken back this way."
      },
      {
        "title": "Does it work if I close my browser?",
        "body": "No. The extension needs the computer, browser and WhatsApp Web to be available. If WhatsApp does not show a message, the extension may not see it either. Do not expect it to keep working with the browser closed."
      },
      {
        "title": "Will it copy old chats or download photos and files?",
        "body": "It does not collect your whole history. When you first connect, it does not take old messages already on screen. This first version handles text and available captions. It does not transfer photo, audio or video files, or open view-once content."
      },
      {
        "title": "Does it keep my messages?",
        "body": "It can keep messages in this browser while waiting to pass them on. There is a limit so they do not build up forever. Messages waiting for over a day are removed the next time it checks, and the connection pauses. RELAYERS and the services you connect may keep what they receive. Disconnecting removes the connection details and waiting messages here, not what those services already received."
      },
      {
        "title": "Will I know if the person received it? Could it send twice?",
        "body": "The extension can show that WhatsApp accepted a request to send. That does not prove the person received or read the message. It remembers requests to help avoid repeating the same send. If it cannot be sure what happened, check WhatsApp before asking for another send."
      },
      {
        "title": "What happens when I pause? Can I change accounts?",
        "body": "Pause stops new exchanges and keeps messages already waiting here. When you continue, it handles those and new incoming messages. It does not go back to collect the time you paused. Something already started may finish. This version connects one account at a time in this extension. If you reopen WhatsApp, it only reconnects to that same account."
      },
      {
        "title": "Is it official? Do I have to pay? Is it ready?",
        "body": "It is not made or approved by WhatsApp or Meta. It is an open project anyone can inspect. You do not need to donate to use the features, and it adds no ads. Optional AI and other services have their own prices and rules. It is still a test version: RELAYERS was tested for real, but WhatsApp was imitated in those tests. A real WhatsApp account still needs checking."
      }
    ],
    "install": {
      "firefox": [
        "Click the download button below. On the page that opens, download the file with Firefox in its name. Open it and extract its contents into a folder.",
        "Paste about:debugging#/runtime/this-firefox into the browser address bar. Click “Load Temporary Add-on…”. In the folder you extracted, choose the file named manifest.json.",
        "Keep WhatsApp open and signed in. Open Bridge from the extensions button in the browser. You can already look at your chats and try a reply with someone who agreed to help you test.",
        "To connect RELAYERS, click its name inside the extension. Follow the sign-in and confirmation steps. Choose the chats, then allow receiving, sending, or both."
      ],
      "chrome": [
        "Click the download button below. On the page that opens, download the file with Chrome in its name. Open it and extract its contents into a folder.",
        "Paste chrome://extensions into the browser address bar. Turn on “Developer mode”. Click “Load unpacked” and choose the folder you extracted.",
        "Keep WhatsApp open and signed in. Open Bridge from the extensions button in the browser. You can already look at your chats and try a reply with someone who agreed to help you test.",
        "To connect RELAYERS, click its name inside the extension. Follow the sign-in and confirmation steps. Choose the chats, then allow receiving, sending, or both."
      ]
    }
  },
  "pt": {
    "features": [
      {
        "icon": "↩",
        "title": "Responda sem sair do que está fazendo",
        "body": "Abra a extensão, escolha a conversa, escreva e clique em Enviar. Seu WhatsApp faz o envio. Você continua na página em que estava."
      },
      {
        "icon": "≡",
        "title": "Salve as respostas que mais usa",
        "body": "Salve uma resposta uma vez. Na próxima, escolha, ajuste o que precisar e envie. Menos digitação, menos resposta repetida para escrever."
      },
      {
        "icon": "⌕",
        "title": "Encontre a conversa certa",
        "body": "Busque a pessoa e leia a mensagem disponível antes de responder. Fotos, áudios e arquivos podem aparecer com uma indicação e a legenda disponível. A extensão não baixa esses arquivos."
      },
      {
        "icon": "✧",
        "title": "Peça uma sugestão à IA, se quiser",
        "body": "Peça uma sugestão de resposta, leia e decida se quer enviar. Você precisa de uma chave do OpenRouter, um código de acesso da sua conta. O texto vai para esse serviço de IA, que pode cobrar. Nada é gerado sem você pedir."
      },
      {
        "icon": "99",
        "title": "Veja o que ainda não foi lido",
        "body": "O ícone da extensão mostra quantas mensagens não lidas consegue ver no WhatsApp, até 99+. Sem uma notificação extra pulando na frente do seu trabalho."
      },
      {
        "icon": "↗",
        "title": "O link usa a aba que você já tem",
        "body": "Clique em um link de conversa compatível do WhatsApp. A conversa abre dentro do WhatsApp já carregado, sem recarregá-lo. Se não conseguir abrir desse jeito, mostra um erro."
      }
    ],
    "controls": [
      {
        "title": "Escolha quem entra",
        "body": "Conecte uma conta do WhatsApp por vez nesta extensão. Escolha até 50 conversas. Não funciona na navegação anônima. Se reabrir o WhatsApp, reconecte a mesma conta."
      },
      {
        "title": "Ajude a evitar envios repetidos",
        "body": "A extensão se lembra dos pedidos de envio. Se o mesmo pedido chegar de novo, confere o resultado que já tem. Se não tiver certeza do que aconteceu, avisa para você conferir o WhatsApp em vez de tentar enviar às cegas."
      },
      {
        "title": "Pause ou desconecte quando quiser",
        "body": "Pausar interrompe novas trocas e guarda o que ainda espera para ser encaminhado. Desconectar apaga os dados da conexão e as mensagens em espera deste navegador. Algo que já começou ainda pode terminar."
      },
      {
        "title": "Saiba para onde suas mensagens vão",
        "body": "Para levar mensagens ao RELAYERS, a extensão precisa ler e encaminhar as conversas que você permitiu. O RELAYERS e outros serviços que você conectar podem guardá-las. Desconectar aqui não apaga o que já foi enviado a esses serviços."
      }
    ],
    "faq": [
      {
        "title": "O RELAYERS pode enviar mensagens pelo meu WhatsApp?",
        "body": "Sim, se você permitir o envio e escolher as conversas. Seu programa pode pedir ao RELAYERS para enviar, mesmo de outro lugar. A extensão recebe o pedido e envia pelo seu WhatsApp aberto. Você não precisa clicar em Enviar toda vez. Deixe o computador, o navegador e o WhatsApp disponíveis."
      },
      {
        "title": "O que eu recebo também pode ir para o RELAYERS?",
        "body": "Sim. Escolha as conversas e permita receber. Novas mensagens que chegarem e que a extensão conseguir ver podem ir para o RELAYERS. Isso inclui o texto, as legendas disponíveis, a data e informações que identificam a conversa e a mensagem. Você escolhe o que acontece depois no RELAYERS. As mensagens enviadas pela sua própria conta não voltam por esse caminho."
      },
      {
        "title": "Funciona se eu fechar o navegador?",
        "body": "Não. A extensão precisa que o computador, o navegador e o WhatsApp Web estejam disponíveis. Se o WhatsApp não mostrar uma mensagem, a extensão pode não conseguir vê-la. Não espere que continue trabalhando com o navegador fechado."
      },
      {
        "title": "Vai copiar conversas antigas ou baixar fotos e arquivos?",
        "body": "Não pega todo o seu histórico. Ao conectar pela primeira vez, não leva as mensagens antigas que já estavam na tela. Esta primeira versão trabalha com texto e legendas disponíveis. Não transfere arquivos de foto, áudio ou vídeo nem abre conteúdo de visualização única."
      },
      {
        "title": "Ele guarda minhas mensagens?",
        "body": "Pode guardar mensagens neste navegador enquanto espera para encaminhá-las. Há um limite para elas não se acumularem para sempre. As que esperam há mais de um dia são apagadas na próxima verificação, e a conexão pausa. O RELAYERS e os serviços que você conectar podem guardar o que recebem. Desconectar apaga os dados da conexão e as mensagens em espera daqui, não o que esses serviços já receberam."
      },
      {
        "title": "Vou saber se a pessoa recebeu? Pode enviar duas vezes?",
        "body": "A extensão pode mostrar que o WhatsApp aceitou um pedido de envio. Isso não prova que a pessoa recebeu ou leu a mensagem. Ela se lembra dos pedidos para ajudar a evitar repetir o mesmo envio. Se não tiver certeza do que aconteceu, confira o WhatsApp antes de pedir outro envio."
      },
      {
        "title": "O que acontece ao pausar? Posso trocar de conta?",
        "body": "Pausar interrompe novas trocas e guarda as mensagens que já estavam esperando aqui. Ao continuar, cuida delas e das novas mensagens que chegarem. Não volta para buscar o que aconteceu durante a pausa. Algo já iniciado pode terminar. Esta versão conecta uma conta por vez nesta extensão. Se você reabrir o WhatsApp, só reconecta à mesma conta."
      },
      {
        "title": "É oficial? Preciso pagar? Já está pronto?",
        "body": "Não é feito nem aprovado pelo WhatsApp ou pela Meta. É um projeto aberto que qualquer pessoa pode consultar. Você não precisa doar para usar os recursos, e ele não adiciona anúncios. A IA opcional e os outros serviços têm seus próprios preços e regras. Ainda é uma versão de teste: o RELAYERS foi testado de verdade, mas o WhatsApp foi imitado nesses testes. Falta conferir com uma conta real do WhatsApp."
      }
    ],
    "install": {
      "firefox": [
        "Clique no botão de baixar abaixo. Na página que abrir, baixe o arquivo com Firefox no nome. Abra o arquivo e extraia o conteúdo para uma pasta.",
        "Cole about:debugging#/runtime/this-firefox na barra de endereços. Clique em “Load Temporary Add-on…”. Na pasta que você extraiu, escolha o arquivo chamado manifest.json.",
        "Deixe o WhatsApp aberto e conectado. Abra a Bridge pelo botão de extensões do navegador. Você já pode ver as conversas e testar uma resposta com alguém que combinou ajudar.",
        "Para conectar o RELAYERS, clique no nome dele dentro da extensão. Siga os passos para entrar na conta e confirmar. Escolha as conversas e permita receber, enviar ou os dois."
      ],
      "chrome": [
        "Clique no botão de baixar abaixo. Na página que abrir, baixe o arquivo com Chrome no nome. Abra o arquivo e extraia o conteúdo para uma pasta.",
        "Cole chrome://extensions na barra de endereços. Ative o botão “Modo do desenvolvedor”. Clique em “Carregar sem compactação” e escolha a pasta que você extraiu.",
        "Deixe o WhatsApp aberto e conectado. Abra a Bridge pelo botão de extensões do navegador. Você já pode ver as conversas e testar uma resposta com alguém que combinou ajudar.",
        "Para conectar o RELAYERS, clique no nome dele dentro da extensão. Siga os passos para entrar na conta e confirmar. Escolha as conversas e permita receber, enviar ou os dois."
      ]
    }
  },
  "es": {
    "features": [
      {
        "icon": "↩",
        "title": "Responde sin cambiar de tarea",
        "body": "Abre la extensión, elige el chat, escribe y pulsa Enviar. Tu WhatsApp lo envía. Tú sigues en la página que estabas usando."
      },
      {
        "icon": "≡",
        "title": "Guarda las respuestas que más usas",
        "body": "Guarda una respuesta una vez. La próxima, elígela, cambia lo necesario y envía. Menos escribir lo mismo cada vez."
      },
      {
        "icon": "⌕",
        "title": "Encuentra el chat correcto",
        "body": "Busca a la persona y lee el mensaje disponible antes de responder. Las fotos, audios y archivos pueden mostrar una indicación y su descripción disponible. La extensión no los descarga."
      },
      {
        "icon": "✧",
        "title": "Pide una sugerencia a la IA, si quieres",
        "body": "Pide una sugerencia, léela y decide si envías. Necesitas una clave de OpenRouter, un código de acceso de tu cuenta. El texto va a ese servicio de IA, que puede cobrar. No se genera nada hasta que lo pidas."
      },
      {
        "icon": "99",
        "title": "Mira lo que sigue sin leer",
        "body": "El icono muestra los mensajes sin leer que puede ver en WhatsApp, hasta 99+. Sin una notificación extra saltando delante de tu trabajo."
      },
      {
        "icon": "↗",
        "title": "El enlace usa la pestaña que ya tienes",
        "body": "Pulsa un enlace de chat compatible de WhatsApp. La conversación se abre dentro del WhatsApp ya cargado, sin recargarlo. Si no puede hacerlo así, muestra un error."
      }
    ],
    "controls": [
      {
        "title": "Elige quién entra",
        "body": "Conecta una cuenta de WhatsApp a la vez en esta extensión. Elige hasta 50 chats. No funciona en navegación privada. Si reabres WhatsApp, conecta la misma cuenta."
      },
      {
        "title": "Ayuda a evitar envíos repetidos",
        "body": "La extensión recuerda las peticiones de envío. Si llega la misma otra vez, revisa el resultado que ya tiene. Si no sabe con certeza qué pasó, te avisa para revisar WhatsApp en vez de enviar a ciegas."
      },
      {
        "title": "Pausa o desconecta cuando quieras",
        "body": "Pausar detiene nuevos intercambios y conserva lo que espera para reenviarse. Desconectar borra los datos de conexión y mensajes en espera de este navegador. Algo ya iniciado puede terminar."
      },
      {
        "title": "Sabe adónde van tus mensajes",
        "body": "Para llevar mensajes a RELAYERS, la extensión necesita leer y reenviar los chats permitidos. RELAYERS y otros servicios conectados pueden guardarlos. Desconectar aquí no borra lo que ya se envió a esos servicios."
      }
    ],
    "faq": [
      {
        "title": "¿RELAYERS puede enviar por mi WhatsApp?",
        "body": "Sí, si permites enviar y eliges los chats. Tu programa puede pedir a RELAYERS que envíe, incluso desde otro lugar. La extensión recibe la petición y envía por tu WhatsApp abierto. No necesitas pulsar Enviar cada vez. Deja disponibles el ordenador, el navegador y WhatsApp."
      },
      {
        "title": "¿Lo que recibo también puede ir a RELAYERS?",
        "body": "Sí. Elige los chats y permite recibir. Los nuevos mensajes que lleguen y que la extensión pueda ver pueden ir a RELAYERS. Incluye texto, descripciones disponibles, fecha y datos que identifican el chat y el mensaje. Tú eliges qué pasa después en RELAYERS. Los mensajes de tu propia cuenta no vuelven por este camino."
      },
      {
        "title": "¿Funciona si cierro el navegador?",
        "body": "No. La extensión necesita que el ordenador, el navegador y WhatsApp Web estén disponibles. Si WhatsApp no muestra un mensaje, la extensión puede no verlo. No esperes que siga funcionando con el navegador cerrado."
      },
      {
        "title": "¿Copia chats antiguos o descarga fotos y archivos?",
        "body": "No recoge todo tu historial. Al conectar por primera vez, no lleva los mensajes antiguos que ya estaban en pantalla. Esta primera versión trabaja con texto y descripciones disponibles. No transfiere fotos, audios o vídeos ni abre contenido de una sola vista."
      },
      {
        "title": "¿Guarda mis mensajes?",
        "body": "Puede guardar mensajes en este navegador mientras esperan para reenviarse. Hay un límite para que no se acumulen para siempre. Los que esperan más de un día se borran en la próxima revisión y la conexión se pausa. RELAYERS y los servicios conectados pueden guardar lo recibido. Desconectar borra lo pendiente y la conexión aquí, no lo que esos servicios ya recibieron."
      },
      {
        "title": "¿Sabré si la persona lo recibió? ¿Puede enviar dos veces?",
        "body": "La extensión puede mostrar que WhatsApp aceptó una petición de envío. No prueba que la persona recibió o leyó el mensaje. Recuerda las peticiones para ayudar a evitar repetir el envío. Si no hay certeza de qué pasó, revisa WhatsApp antes de pedir otro envío."
      },
      {
        "title": "¿Qué pasa al pausar? ¿Puedo cambiar de cuenta?",
        "body": "Pausar detiene nuevos intercambios y conserva lo que ya esperaba aquí. Al continuar, atiende esos mensajes y los nuevos. No vuelve a recoger lo del tiempo pausado. Algo ya iniciado puede terminar. Esta versión conecta una cuenta a la vez en la extensión. Si reabres WhatsApp, solo reconecta la misma cuenta."
      },
      {
        "title": "¿Es oficial? ¿Tengo que pagar? ¿Ya está listo?",
        "body": "No está hecho ni aprobado por WhatsApp o Meta. Es un proyecto abierto que cualquiera puede revisar. No necesitas donar para usar sus funciones y no añade anuncios. La IA opcional y otros servicios tienen sus precios y reglas. Sigue siendo de prueba: RELAYERS se probó de verdad, pero WhatsApp fue imitado. Falta comprobar una cuenta real de WhatsApp."
      }
    ],
    "install": {
      "firefox": [
        "Pulsa el botón de descarga. En la página que abre, descarga el archivo con Firefox en el nombre. Ábrelo y extrae el contenido en una carpeta.",
        "Pega about:debugging#/runtime/this-firefox en la barra de direcciones. Pulsa “Load Temporary Add-on…”. En la carpeta extraída, elige el archivo manifest.json.",
        "Deja WhatsApp abierto y conectado. Abre Bridge desde el botón de extensiones. Ya puedes ver los chats y probar una respuesta con alguien que aceptó ayudarte.",
        "Para conectar RELAYERS, pulsa su nombre dentro de la extensión. Sigue los pasos para entrar y confirmar. Elige los chats y permite recibir, enviar o ambos."
      ],
      "chrome": [
        "Pulsa el botón de descarga. En la página que abre, descarga el archivo con Chrome en el nombre. Ábrelo y extrae el contenido en una carpeta.",
        "Pega chrome://extensions en la barra de direcciones. Activa “Modo desarrollador”. Pulsa “Cargar descomprimida” y elige la carpeta extraída.",
        "Deja WhatsApp abierto y conectado. Abre Bridge desde el botón de extensiones. Ya puedes ver los chats y probar una respuesta con alguien que aceptó ayudarte.",
        "Para conectar RELAYERS, pulsa su nombre dentro de la extensión. Sigue los pasos para entrar y confirmar. Elige los chats y permite recibir, enviar o ambos."
      ]
    }
  },
  "id": {
    "features": [
      {
        "icon": "↩",
        "title": "Balas tanpa berpindah tugas",
        "body": "Buka ekstensi, pilih obrolan, tulis dan klik Kirim. WhatsApp Anda yang mengirim. Anda tetap di halaman yang sedang dipakai."
      },
      {
        "icon": "≡",
        "title": "Simpan balasan yang sering dipakai",
        "body": "Simpan balasan sekali. Lain kali, pilih, ubah seperlunya, lalu kirim. Tidak perlu mengetik jawaban yang sama terus."
      },
      {
        "icon": "⌕",
        "title": "Temukan obrolan yang tepat",
        "body": "Cari orangnya dan baca pesan yang tersedia sebelum membalas. Foto, audio, dan file bisa ditampilkan sebagai penanda serta keterangan yang tersedia. Ekstensi tidak mengunduhnya."
      },
      {
        "icon": "✧",
        "title": "Minta saran AI, jika mau",
        "body": "Minta saran balasan, baca, lalu putuskan apakah ingin mengirim. Perlu kunci OpenRouter sendiri, yaitu kode akses dari akun Anda. Teks dikirim ke layanan AI itu, yang mungkin berbayar. Tidak dibuat sebelum Anda meminta."
      },
      {
        "icon": "99",
        "title": "Lihat yang belum dibaca",
        "body": "Ikon ekstensi menunjukkan jumlah belum dibaca yang terlihat di WhatsApp, hingga 99+. Tanpa notifikasi tambahan melompat di depan pekerjaan Anda."
      },
      {
        "icon": "↗",
        "title": "Tautan memakai tab yang sudah ada",
        "body": "Klik tautan obrolan WhatsApp yang didukung. Obrolan terbuka di WhatsApp yang sudah dimuat, tanpa memuat ulang. Jika tidak bisa dibuka begitu, akan ada pesan kesalahan."
      }
    ],
    "controls": [
      {
        "title": "Pilih siapa yang termasuk",
        "body": "Hubungkan satu akun WhatsApp pada satu waktu di ekstensi ini. Pilih hingga 50 obrolan. Tidak berjalan dalam penjelajahan pribadi. Jika membuka ulang WhatsApp, sambungkan akun yang sama."
      },
      {
        "title": "Bantu cegah kirim dua kali",
        "body": "Ekstensi mengingat permintaan kirim. Jika permintaan sama datang lagi, hasil yang ada diperiksa. Jika belum pasti apa yang terjadi, Anda diminta mengecek WhatsApp daripada mengirim ulang begitu saja."
      },
      {
        "title": "Jeda atau putuskan kapan saja",
        "body": "Jeda menghentikan pertukaran baru dan menyimpan yang masih menunggu diteruskan. Putuskan menghapus detail koneksi dan pesan menunggu dari browser ini. Yang sudah dimulai masih bisa selesai."
      },
      {
        "title": "Ketahui ke mana pesan Anda pergi",
        "body": "Untuk membawa pesan ke RELAYERS, ekstensi perlu membaca dan meneruskan obrolan yang diizinkan. RELAYERS dan layanan lain yang dihubungkan dapat menyimpannya. Memutuskan di sini tidak menghapus yang sudah dikirim ke layanan itu."
      }
    ],
    "faq": [
      {
        "title": "Bisakah RELAYERS mengirim lewat WhatsApp saya?",
        "body": "Bisa, jika Anda mengizinkan pengiriman dan memilih obrolannya. Program bisa meminta RELAYERS mengirim, bahkan dari tempat lain. Ekstensi menerima permintaan dan mengirim lewat WhatsApp terbuka. Tidak perlu klik Kirim setiap kali. Komputer, browser, dan WhatsApp harus tersedia."
      },
      {
        "title": "Bisakah pesan yang saya terima juga masuk ke RELAYERS?",
        "body": "Bisa. Pilih obrolan dan izinkan menerima. Pesan masuk baru yang terlihat oleh ekstensi bisa dibawa ke RELAYERS. Termasuk teks, keterangan yang tersedia, tanggal, dan informasi penanda obrolan serta pesan. Anda memilih langkah berikutnya di RELAYERS. Pesan dari akun sendiri tidak dibawa kembali melalui cara ini."
      },
      {
        "title": "Apakah tetap bekerja jika browser ditutup?",
        "body": "Tidak. Komputer, browser, dan WhatsApp Web harus tersedia. Jika WhatsApp tidak menampilkan pesan, ekstensi mungkin juga tidak melihatnya. Jangan berharap tetap bekerja saat browser ditutup."
      },
      {
        "title": "Apakah menyalin obrolan lama atau mengunduh foto dan file?",
        "body": "Tidak mengambil seluruh riwayat. Saat pertama terhubung, pesan lama yang sudah tampil tidak dibawa. Versi awal ini memakai teks dan keterangan yang tersedia. Tidak memindahkan file foto, audio, video, atau membuka konten sekali lihat."
      },
      {
        "title": "Apakah pesan saya disimpan?",
        "body": "Pesan bisa disimpan di browser ini sambil menunggu diteruskan. Ada batas agar tidak menumpuk selamanya. Yang menunggu lebih dari sehari dihapus pada pemeriksaan berikutnya dan koneksi dijeda. RELAYERS dan layanan terhubung dapat menyimpan yang diterima. Putuskan menghapus detail koneksi dan pesan menunggu di sini, bukan yang sudah diterima layanan itu."
      },
      {
        "title": "Apakah saya tahu pesannya diterima? Bisa terkirim dua kali?",
        "body": "Ekstensi bisa menunjukkan WhatsApp menerima permintaan kirim. Itu bukan bukti orangnya menerima atau membaca pesan. Permintaan diingat untuk membantu mencegah pengiriman berulang. Jika hasilnya belum pasti, periksa WhatsApp sebelum meminta kirim lagi."
      },
      {
        "title": "Apa yang terjadi saat dijeda? Bisa ganti akun?",
        "body": "Jeda menghentikan pertukaran baru dan menyimpan pesan yang sudah menunggu. Saat dilanjutkan, pesan itu dan pesan baru diproses. Tidak mengambil ulang yang terjadi selama jeda. Yang sudah dimulai dapat selesai. Versi ini menghubungkan satu akun pada satu waktu di ekstensi. Jika WhatsApp dibuka ulang, hanya akun yang sama yang disambungkan."
      },
      {
        "title": "Apakah resmi? Harus bayar? Sudah siap?",
        "body": "Bukan dibuat atau disetujui WhatsApp maupun Meta. Ini proyek terbuka yang bisa diperiksa siapa saja. Tidak perlu donasi untuk memakai fitur dan tidak ada iklan tambahan. AI opsional dan layanan lain punya harga serta aturan sendiri. Masih versi uji: RELAYERS diuji sungguhan, tetapi memakai tiruan WhatsApp. Akun WhatsApp nyata masih perlu dicek."
      }
    ],
    "install": {
      "firefox": [
        "Klik tombol unduh di bawah. Pada halaman yang terbuka, unduh file dengan nama Firefox. Buka dan ekstrak isinya ke folder.",
        "Tempel about:debugging#/runtime/this-firefox di bilah alamat. Klik “Load Temporary Add-on…”. Di folder yang diekstrak, pilih file manifest.json.",
        "Biarkan WhatsApp terbuka dan login. Buka Bridge dari tombol ekstensi browser. Anda sudah bisa melihat obrolan dan mencoba balasan dengan orang yang setuju membantu pengujian.",
        "Untuk menghubungkan RELAYERS, klik namanya di dalam ekstensi. Ikuti langkah login dan konfirmasi. Pilih obrolan, lalu izinkan menerima, mengirim, atau keduanya."
      ],
      "chrome": [
        "Klik tombol unduh di bawah. Pada halaman yang terbuka, unduh file dengan nama Chrome. Buka dan ekstrak isinya ke folder.",
        "Tempel chrome://extensions di bilah alamat. Aktifkan “Developer mode”. Klik “Load unpacked” dan pilih folder yang diekstrak.",
        "Biarkan WhatsApp terbuka dan login. Buka Bridge dari tombol ekstensi browser. Anda sudah bisa melihat obrolan dan mencoba balasan dengan orang yang setuju membantu pengujian.",
        "Untuk menghubungkan RELAYERS, klik namanya di dalam ekstensi. Ikuti langkah login dan konfirmasi. Pilih obrolan, lalu izinkan menerima, mengirim, atau keduanya."
      ]
    }
  },
  "hi": {
    "features": [
      {
        "icon": "↩",
        "title": "काम छोड़े बिना जवाब दें",
        "body": "एक्सटेंशन खोलें, चैट चुनें, लिखें और भेजें दबाएँ। आपका WhatsApp भेजता है। आप उसी पेज पर रहते हैं।"
      },
      {
        "icon": "≡",
        "title": "रोज़ वाले जवाब सेव करें",
        "body": "एक बार जवाब सेव करें। अगली बार चुनें, ज़रूरत हो तो बदलें और भेजें। वही जवाब बार-बार नहीं लिखना पड़ेगा।"
      },
      {
        "icon": "⌕",
        "title": "सही चैट ढूँढें",
        "body": "जवाब देने से पहले व्यक्ति खोजें और उपलब्ध संदेश पढ़ें। फोटो, ऑडियो और फ़ाइल के लिए संकेत और उपलब्ध कैप्शन दिख सकता है। एक्सटेंशन उन्हें डाउनलोड नहीं करता।"
      },
      {
        "icon": "✧",
        "title": "चाहें तो AI से सुझाव लें",
        "body": "जवाब का सुझाव माँगें, पढ़ें और तय करें कि भेजना है या नहीं। अपनी OpenRouter कुंजी चाहिए, जो खाते का एक्सेस कोड है। टेक्स्ट उस AI सेवा को जाता है, जो शुल्क ले सकती है। आपके कहे बिना सुझाव नहीं बनता।"
      },
      {
        "icon": "99",
        "title": "देखें क्या नहीं पढ़ा गया",
        "body": "आइकन WhatsApp में दिख रही अनरीड संख्या बताता है, 99+ तक। काम के बीच कोई अतिरिक्त पॉपअप सूचना नहीं आती।"
      },
      {
        "icon": "↗",
        "title": "लिंक वही खुला टैब उपयोग करता है",
        "body": "समर्थित WhatsApp चैट लिंक क्लिक करें। बातचीत पहले से लोड WhatsApp में खुलती है, बिना रीलोड किए। ऐसा न हो पाए तो त्रुटि दिखती है।"
      }
    ],
    "controls": [
      {
        "title": "चुनें किसे शामिल करना है",
        "body": "इस एक्सटेंशन में एक समय पर एक WhatsApp खाता जोड़ें। अधिकतम 50 चैट चुनें। निजी ब्राउज़िंग में काम नहीं करता। WhatsApp दोबारा खोलें तो वही खाता जोड़ें।"
      },
      {
        "title": "दो बार भेजने से बचने में मदद",
        "body": "एक्सटेंशन भेजने के अनुरोध याद रखता है। वही अनुरोध फिर आए तो पहले का परिणाम देखता है। अगर पक्का न हो तो दोबारा भेजने के बजाय WhatsApp जाँचने को कहता है।"
      },
      {
        "title": "जब चाहें रोकें या हटाएँ",
        "body": "रोकने पर नई अदला-बदली बंद होती है और इंतज़ार वाले संदेश रहते हैं। कनेक्शन हटाने पर इस ब्राउज़र से कनेक्शन की जानकारी और इंतज़ार वाले संदेश मिटते हैं। शुरू हुआ काम फिर भी पूरा हो सकता है।"
      },
      {
        "title": "जानें आपके संदेश कहाँ जाते हैं",
        "body": "संदेश RELAYERS तक ले जाने के लिए एक्सटेंशन को अनुमति वाली चैट पढ़कर आगे भेजनी होती है। RELAYERS और आपकी जोड़ी सेवाएँ उन्हें रख सकती हैं। यहाँ कनेक्शन हटाने से वहाँ पहले भेजा डेटा नहीं मिटता।"
      }
    ],
    "faq": [
      {
        "title": "क्या RELAYERS मेरे WhatsApp से संदेश भेज सकता है?",
        "body": "हाँ, अगर आप भेजने की अनुमति देकर चैट चुनें। आपका प्रोग्राम दूसरी जगह से भी RELAYERS को भेजने को कह सकता है। एक्सटेंशन अनुरोध पाकर खुले WhatsApp से भेजता है। हर बार भेजें क्लिक करना ज़रूरी नहीं। कंप्यूटर, ब्राउज़र और WhatsApp उपलब्ध रखें।"
      },
      {
        "title": "क्या मुझे मिले संदेश भी RELAYERS तक जा सकते हैं?",
        "body": "हाँ। चैट चुनें और पाने की अनुमति दें। एक्सटेंशन को दिखने वाले नए संदेश RELAYERS तक जा सकते हैं। इनमें टेक्स्ट, उपलब्ध कैप्शन, तारीख और चैट व संदेश की पहचान वाली जानकारी शामिल है। RELAYERS में आगे क्या हो, आप चुनें। आपके अपने भेजे संदेश इस रास्ते वापस नहीं आते।"
      },
      {
        "title": "ब्राउज़र बंद कर दूँ तो काम करेगा?",
        "body": "नहीं। कंप्यूटर, ब्राउज़र और WhatsApp Web उपलब्ध होने चाहिए। WhatsApp कोई संदेश न दिखाए तो एक्सटेंशन भी उसे नहीं देख सकता। ब्राउज़र बंद होने पर काम जारी रहने की उम्मीद न करें।"
      },
      {
        "title": "क्या पुरानी चैट कॉपी या फोटो और फ़ाइल डाउनलोड करेगा?",
        "body": "पूरा इतिहास नहीं लेता। पहली बार जोड़ने पर पहले से दिख रहे पुराने संदेश नहीं ले जाता। यह पहला संस्करण टेक्स्ट और उपलब्ध कैप्शन के साथ काम करता है। फोटो, ऑडियो, वीडियो फ़ाइलें नहीं भेजता और एक बार देखने वाला कंटेंट नहीं खोलता।"
      },
      {
        "title": "क्या यह मेरे संदेश रखता है?",
        "body": "आगे भेजने का इंतज़ार करते संदेश इस ब्राउज़र में रख सकता है। इनके जमा होने की सीमा है। एक दिन से ज़्यादा रुके संदेश अगली जाँच पर मिटते हैं और कनेक्शन रुकता है। RELAYERS और आपकी जोड़ी सेवाएँ मिले संदेश रख सकती हैं। डिस्कनेक्ट यहाँ की कनेक्शन जानकारी और इंतज़ार वाले संदेश मिटाता है, सेवाओं को पहले मिले संदेश नहीं।"
      },
      {
        "title": "क्या पता चलेगा सामने वाले को मिला? दो बार भेज सकता है?",
        "body": "एक्सटेंशन दिखा सकता है कि WhatsApp ने भेजने का अनुरोध स्वीकार किया। इससे यह साबित नहीं होता कि व्यक्ति ने पाया या पढ़ा। दोहराव से बचने के लिए अनुरोध याद रखता है। नतीजा पक्का न हो तो फिर भेजने को कहने से पहले WhatsApp देखें।"
      },
      {
        "title": "रोकने पर क्या होगा? क्या खाता बदल सकता हूँ?",
        "body": "रोकने पर नई अदला-बदली बंद और यहाँ इंतज़ार वाले संदेश रहते हैं। जारी करने पर वे और नए संदेश चलते हैं। रुके समय के संदेश वापस नहीं लाता। शुरू हुआ काम पूरा हो सकता है। इस संस्करण में एक्सटेंशन एक समय पर एक खाता जोड़ता है। WhatsApp दोबारा खोलें तो वही खाता दोबारा जुड़ता है।"
      },
      {
        "title": "क्या आधिकारिक है? क्या पैसे लगते हैं? क्या तैयार है?",
        "body": "यह WhatsApp या Meta द्वारा बनाया या मंज़ूर नहीं है। खुला प्रोजेक्ट है जिसे कोई भी देख सकता है। सुविधाओं के लिए दान ज़रूरी नहीं और विज्ञापन नहीं जोड़ता। वैकल्पिक AI व अन्य सेवाओं के अपने शुल्क और नियम हैं। अभी टेस्ट संस्करण है: RELAYERS असली था, पर जाँच में WhatsApp की नकल थी। असली WhatsApp खाते से जाँच बाकी है।"
      }
    ],
    "install": {
      "firefox": [
        "नीचे डाउनलोड बटन दबाएँ। खुले पेज पर Firefox नाम वाली फ़ाइल लें। उसे खोलकर सामग्री एक फ़ोल्डर में निकालें।",
        "एड्रेस बार में about:debugging#/runtime/this-firefox पेस्ट करें। “Load Temporary Add-on…” दबाएँ। निकाले फ़ोल्डर में manifest.json फ़ाइल चुनें।",
        "WhatsApp खुला और लॉगिन रखें। ब्राउज़र के एक्सटेंशन बटन से Bridge खोलें। चैट देखें और जाँच में मदद के लिए तैयार व्यक्ति को जवाब आज़माएँ।",
        "RELAYERS जोड़ने के लिए एक्सटेंशन में उसका नाम दबाएँ। लॉगिन और पुष्टि के कदम पूरे करें। चैट चुनें, फिर पाने, भेजने या दोनों की अनुमति दें।"
      ],
      "chrome": [
        "नीचे डाउनलोड बटन दबाएँ। खुले पेज पर Chrome नाम वाली फ़ाइल लें। उसे खोलकर सामग्री एक फ़ोल्डर में निकालें।",
        "एड्रेस बार में chrome://extensions पेस्ट करें। “Developer mode” चालू करें। “Load unpacked” दबाकर निकाला फ़ोल्डर चुनें।",
        "WhatsApp खुला और लॉगिन रखें। ब्राउज़र के एक्सटेंशन बटन से Bridge खोलें। चैट देखें और जाँच में मदद के लिए तैयार व्यक्ति को जवाब आज़माएँ।",
        "RELAYERS जोड़ने के लिए एक्सटेंशन में उसका नाम दबाएँ। लॉगिन और पुष्टि के कदम पूरे करें। चैट चुनें, फिर पाने, भेजने या दोनों की अनुमति दें।"
      ]
    }
  }
};
