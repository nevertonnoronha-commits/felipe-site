# Kit de coleta de depoimentos — UPTEC

Documento interno. A UPTEC tem 100+ equipamentos sob contrato, o que significa
uma base grande de clientes que podem falar. O objetivo aqui é obter depoimentos
reais, atribuídos e autorizados, em poucos dias.

Depoimento real vence depoimento genérico por três motivos práticos: pode ser
publicado com nome e cargo, pode receber marcação `Review` no schema.org (o que
alimenta busca e citação por IA), e traz detalhes concretos que ninguém inventaria.

## Como as perguntas foram construídas

Cada pergunta abaixo foi desenhada para que a resposta honesta caia sobre uma
objeção específica, sem induzir o cliente a dizer o que queremos ouvir. Perguntas
que induzem ("você gostou do nosso relatório fotográfico?") geram respostas
monossilábicas e sem valor. Perguntas abertas sobre a experiência geram frases
citáveis.

| Pergunta | Objeção que a resposta tende a quebrar |
|---|---|
| 1. Antes de fechar com a UPTEC, qual era a sua maior preocupação? | Faz o cliente nomear a objeção com as palavras dele — é o material mais valioso |
| 2. O que pesou na decisão de trocar de empresa? | Diferencial percebido, do lado de fora |
| 3. Teve algum momento em que a gente foi testado de verdade? Como foi? | "E se der problema fora de hora?" — gera a história de emergência |
| 4. Você usa os relatórios que enviamos depois de cada visita? Para quê? | "Não vou saber se fizeram o serviço" — e mostra o uso real do RAT |
| 5. Se um síndico conhecido te perguntasse se vale a pena, o que você diria? | Produz a frase curta e citável |
| 6. Tem alguma coisa que a gente ainda precisa melhorar? | Torna o conjunto crível e devolve dado real de operação |

A pergunta 6 é contraintuitiva mas importante: depoimento sem nenhuma ressalva
soa fabricado. Uma observação pequena e honesta aumenta a credibilidade do
conjunto inteiro.

## Mensagem de abertura (WhatsApp)

Curta, sem parecer cobrança. Enviar do número de quem já tem relação com o
cliente, nunca de um número novo.

> Oi, [nome], tudo bem? Aqui é o [nome] da UPTEC.
>
> A gente está montando uma página com a experiência de quem já é cliente e eu
> queria muito ter a sua. São 6 perguntas rápidas, pode responder por áudio se
> for mais fácil — leva uns 3 minutos.
>
> Se preferir, eu ligo. E se não fizer sentido agora, sem problema nenhum.

Se a pessoa aceitar, enviar as 6 perguntas em uma única mensagem, numeradas.
Áudio funciona melhor que texto: a fala é mais concreta e rende frases melhores.

## Autorização de uso

Pedir sempre, na mesma conversa, depois das respostas:

> Posso publicar sua resposta no site com seu nome e o nome do condomínio?
> Se preferir, publico só como "síndico, [bairro]" — você escolhe.

Guardar o print da autorização. Se o cliente preferir anonimato parcial, use
"Síndico — Condomínio em [bairro], Salvador". Continua sendo real e verificável
internamente.

## Prioridade de quem abordar

1. Cliente que passou por uma emergência atendida dentro do prazo — a história
   mais forte que existe
2. Cliente que trocou de empresa e viu diferença — cobre a objeção de transição
3. Cliente de licitação ou prédio comercial — o segmento com menos prova social
   hoje
4. Cliente antigo, de contrato longo — cobre a objeção de continuidade

Cinco a oito depoimentos bem distribuídos entre esses perfis cobrem todas as
objeções mapeadas no `llms.txt`.

## O que fazer com as respostas

Encaminhar as respostas cruas. A edição permitida é cortar e limpar vícios de
fala — nunca reescrever a ideia nem "melhorar" o que a pessoa disse.

Depois de publicados no site, os depoimentos entram no `llms.txt` com atribuição
e recebem marcação `Review` no JSON-LD, o que os torna elegíveis para citação em
busca e em resposta de IA.

## Google Business Profile

Maior ganho isolado disponível hoje, e independente do site. Avaliações no perfil
do Google pesam em busca local ("empresa de elevadores em Salvador") e são das
fontes mais citadas por assistentes de IA quando alguém pede indicação de empresa
em uma cidade.

Se o perfil ainda não existe, criar e verificar o endereço. Depois, incluir o
link de avaliação na mesma conversa de WhatsApp acima — quem acabou de responder
6 perguntas positivas é quem tem maior chance de deixar avaliação.
