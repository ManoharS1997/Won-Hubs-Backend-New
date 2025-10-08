# presage_server.py
import sys
import markovify

# Sample text corpus (you can expand this for better predictions)
text_corpus = """
Hello, this is a sample text corpus.
You can add more sentences here to improve predictions.
Markov chains generate text based on probabilities of word sequences.
Feel free to modify or load a larger text file for better results.
"""

# Build the Markov model
text_model = markovify.Text(text_corpus)

print("[Presage Server Started]", flush=True)

while True:
    try:
        # Read input text from Node.js
        input_text = input().strip()
        if not input_text:
            print()
            continue

        # Generate a prediction (single sentence)
        prediction = text_model.make_sentence() or ""
        
        # Send prediction back to Node.js
        print(prediction, flush=True)

    except EOFError:
        # Node.js closed the process
        break
    except Exception as e:
        # Send error back
        print(f"[Presage Error]: {str(e)}", flush=True)
