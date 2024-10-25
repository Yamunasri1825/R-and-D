from flask import Flask, request, jsonify
from flask_cors import CORS
import nbformat
from nbconvert.preprocessors import ExecutePreprocessor
import json
import sys
import io

app = Flask(__name__)
CORS(app)

@app.route('/execute-notebook', methods=['POST'])
def execute_notebook():
    print("Received data:", request.data)
    
    try:
        data = request.get_json(force=True)
        print("Parsed JSON:", data)
    except Exception as e:
        print("Error parsing JSON:", str(e))
        return jsonify({'error': f'Invalid JSON: {str(e)}'}), 400

    if 'source_code' in data:
        # Execute the code directly without using nbconvert
        code = data['source_code']
        try:
            # Capture stdout
            old_stdout = sys.stdout
            redirected_output = sys.stdout = io.StringIO()

            # Execute the code
            exec(code)

            # Restore stdout and get output
            sys.stdout = old_stdout
            output = redirected_output.getvalue()

            return jsonify({'output': output})
        except Exception as e:
            return jsonify({'error': f'Error executing code: {str(e)}'}), 500

    elif 'notebook' in data:
        notebook_content = data['notebook']
    else:
        return jsonify({'error': 'No source code or notebook provided'}), 400

    print("Notebook content:", notebook_content)

    try:
        # Ensure the notebook content is in the correct format
        if isinstance(notebook_content, dict):
            notebook = nbformat.from_dict(notebook_content)
        elif isinstance(notebook_content, str):
            notebook = nbformat.reads(notebook_content, as_version=4)
        else:
            raise ValueError("Invalid notebook format")

        # Ensure the source is always a list of strings
        for cell in notebook.cells:
            if cell.cell_type == 'code':
                if isinstance(cell.source, list):
                    cell.source = [str(line) for line in cell.source]
                else:
                    cell.source = [str(cell.source)]

        ep = ExecutePreprocessor(timeout=600, kernel_name='python3')
        ep.preprocess(notebook, {'metadata': {'path': './'}})
        
        # Extract output from the executed notebook
        output = []
        for cell in notebook.cells:
            if cell.cell_type == 'code' and cell.outputs:
                for out in cell.outputs:
                    if 'text' in out:
                        output.append(out['text'])
                    elif 'data' in out and 'text/plain' in out['data']:
                        output.append(out['data']['text/plain'])
        
        output = '\n'.join(output)
        if not output:
            output = "Notebook executed successfully, but produced no output."
    except Exception as e:
        print("Error executing notebook:", str(e))
        return jsonify({'error': f'Error executing notebook: {str(e)}'}), 500

    return jsonify({'output': output})

if __name__ == '__main__':
    app.run(port=5005, debug=True)