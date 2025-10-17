from flask import Flask, render_template, request, jsonify
import time
import os

app = Flask(__name__, static_folder='static', template_folder='templates')

# Simulação: responsta do NotebookLM (substituir por integração real)
def notebooklm_query(question: str) -> dict:
    # Aqui você pode integrar com NotebookLM (quando houver API pública)
    # Por enquanto, entrega respostas baseadas em palavras-chave.
    q = question.lower()
    time.sleep(0.4)  # simula latência
    if "semiótica" in q:
        text = ("Segundo Lênia (inspirada em Santaella), a semiótica "
                "é a ciência dos signos que media as interações entre "
                "seres humanos e tecnologia.")
    elif "pós-humano" in q or "pos-humano" in q:
        text = ("A noção de pós-humano destaca a simbiose entre corpo, "
                "tecnologia e mídias; a cognição se distribui entre agentes.")
    else:
        text = ("Lênia: Ainda estou consultando meu acervo. "
                "Você pode perguntar sobre semiótica, pós-humano ou gêmeos digitais.")
    return {"answer": text, "source": "NotebookLM(simulado)"}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json() or {}
    question = data.get("question", "")
    if not question:
        return jsonify({"error":"Pergunta vazia"}), 400
    response = notebooklm_query(question)
    return jsonify(response)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=False)


