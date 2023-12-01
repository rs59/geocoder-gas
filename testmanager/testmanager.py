import json
import sys

# ANSI escape sequences
ANSI_RESET = "\033[0m"
ANSI_GREEN = "\033[92m"
ANSI_RED = "\033[91m"

global mismatch_found

def color_text(text, color):
    return f"{color}{text}{ANSI_RESET}"

def extract_test_data(test_result):
    global mismatch_found

    module = test_result["value"]["results"]["module"]
    passed = test_result["value"]["results"]["passed"]
    total = test_result["value"]["results"]["total"]

    passed_color = ANSI_GREEN if passed == total else ANSI_RED
    total_color = ANSI_GREEN
    passed_text = color_text(str(passed), passed_color)
    total_text = color_text(str(total), total_color)

    assertions_output = []

    for assertion in test_result["value"]["assertions"]:
        result = assertion["result"]
        expected = assertion["expected"]
        name = assertion["name"]
        message = assertion["message"]

        result_color = ANSI_GREEN if result == expected else ANSI_RED
        expected_color = ANSI_GREEN
        result_text = color_text(str(result), result_color)
        expected_text = color_text(str(expected), expected_color)

        result_outcome = "->" if result == expected else "!="
        assertion_output = f"{name} |\n  {message}"
        assertion_line = f" {expected_text}{result_outcome}{result_text} | {assertion_output} "

        assertions_output.append(assertion_line)

        if result != expected:
            mismatch_found = True

    assertions_all = '\n'.join(assertions_output)
    result_summary = f"{module}: ({passed_text}/{total_text}) [{assertions_all}]"

    return result_summary

def main():
    global mismatch_found
    mismatch_found = False

    if len(sys.argv) != 2:
        print("Usage: python script.py <file_path>")
        sys.exit(1)

    file_path = sys.argv[1]

    try:
        with open(file_path, "r") as file:
            data = json.load(file)
    except FileNotFoundError:
        print(f"File not found: {file_path}")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"Invalid JSON format in file: {file_path}")
        sys.exit(1)

    for entry in data:
        if entry["type"] == "TESTS_RESULTS_ONE":
            print(extract_test_data(entry))

    if mismatch_found:
        raise ValueError(f"Test suite failed.")
        sys.exit(1)


if __name__ == "__main__":
    main()
