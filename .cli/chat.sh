#!/usr/bin/env bash

PIPE_IN=/tmp/chat_in
PIPE_OUT=/tmp/chat_out
ENDPOINT="http://localhost:3000/v1/chat"

# Limpia y crea las FIFOs
rm -f "$PIPE_IN" "$PIPE_OUT"
mkfifo "$PIPE_IN" 
mkfifo "$PIPE_OUT" 

# Demonio que procesa sólo líneas con prefijo __SEND__:
{
  while true; do
    if read -r line < "$PIPE_IN"; then
      case "$line" in
        __SEND__:*)
          text="${line#__SEND__:}"
          # Construye payload JSON
          payload=$(jq -n \
            --arg human "human_1" \
            --arg channel "default" \
            --arg text "$text" \
            '{ context: { human: $human, channel: $channel }, message: { texts: [$text] } }')
          # Hace la request
          response=$(curl -s -X POST -H "Content-Type: application/json" \
            -d "$payload" "$ENDPOINT")
          # Extrae .text y lo escribe en la salida
          echo "$response" | jq -r '.text' > "$PIPE_OUT"
          ;;
      esac
    fi
  done
} &

echo "Servidor de chat arrancado."
echo "Envía mensajes con:"
echo "  echo \"__SEND__:Tu mensaje aquí\" > $PIPE_IN"
echo "Y para ver respuestas:"
echo "  tail -f $PIPE_OUT"

tail -f $PIPE_OUT
