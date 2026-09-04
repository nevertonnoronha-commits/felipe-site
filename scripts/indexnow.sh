#!/usr/bin/env bash
# Avisa Bing e Yandex que paginas mudaram, sem esperar o crawler passar.
# O indice do Bing e o que alimenta as respostas do ChatGPT e do Copilot,
# entao isso encurta o caminho entre publicar e ser citado por IA.
#
#   bash scripts/indexnow.sh                 # envia as 6 URLs do site
#   bash scripts/indexnow.sh /servicos       # envia so as que voce listar
#
# Rode DEPOIS do deploy: o IndexNow busca o arquivo de chave no ar para
# confirmar que quem pediu e mesmo o dono do dominio.

set -euo pipefail
cd "$(dirname "$0")/.."

HOST="uptecelevadores.com"
CHAVE="1d025cba1d7cbd5f4a727b5c396c2c84"
ARQ_CHAVE="https://$HOST/$CHAVE.txt"

if [ $# -gt 0 ]; then
  CAMINHOS=("$@")
else
  CAMINHOS=("/" "/servicos" "/licitacoes" "/condominios" "/elevadores" "/contato")
fi

# monta a lista de URLs em JSON
URLS=$(printf '"https://%s%s",' "$HOST" "${CAMINHOS[@]}" | sed 's/,$//')

CORPO=$(cat <<JSON
{
  "host": "$HOST",
  "key": "$CHAVE",
  "keyLocation": "$ARQ_CHAVE",
  "urlList": [$URLS]
}
JSON
)

echo "enviando ${#CAMINHOS[@]} URL(s) para o IndexNow:"
printf '  https://%s%s\n' "$HOST" "${CAMINHOS[@]}"
echo

# a chave precisa estar acessivel no ar antes do ping
if ! curl -sf -m 10 "$ARQ_CHAVE" >/dev/null; then
  echo "ERRO: $ARQ_CHAVE nao responde. Faca o deploy antes de rodar isto." >&2
  exit 1
fi

STATUS=$(curl -s -o /tmp/indexnow-resposta.txt -w '%{http_code}' \
  -X POST 'https://api.indexnow.org/indexnow' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -d "$CORPO")

case "$STATUS" in
  200) echo "200 - aceito e validado" ;;
  202) echo "202 - aceito, chave em validacao (normal na primeira vez)" ;;
  400) echo "400 - JSON malformado" ;;
  403) echo "403 - chave recusada: confira $ARQ_CHAVE" ;;
  422) echo "422 - alguma URL nao pertence a $HOST" ;;
  429) echo "429 - pedidos demais, tente mais tarde" ;;
  *)   echo "$STATUS - resposta inesperada" ;;
esac
[ -s /tmp/indexnow-resposta.txt ] && sed 's/^/  /' /tmp/indexnow-resposta.txt
