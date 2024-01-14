import json

def add_tags_to_unfiltered(filtered_json_path, unfiltered_json_path, output_json_path):
    # Read the filtered JSON file
    with open(filtered_json_path, 'r') as filtered_file:
        filtered_data = json.load(filtered_file)
        filtered_ids = set(item['id'] for item in filtered_data)

    # Read the unfiltered JSON file
    with open(unfiltered_json_path, 'r') as unfiltered_file:
        unfiltered_data = json.load(unfiltered_file)

    # Update the unfiltered list
    for item in unfiltered_data:
        if item['id'] in filtered_ids:
            item['tags'] = 'lifestyle'

    # Save the modified list to a new JSON file
    with open(output_json_path, 'w') as output_file:
        json.dump(unfiltered_data, output_file, indent=2)

# Example usage:
filtered_json_path = '../notes/lifestyle.json'
unfiltered_json_path = '../images/2024_01_12.json'
output_json_path = '../images/2024_01_12_tagged.json'

add_tags_to_unfiltered(filtered_json_path, unfiltered_json_path, output_json_path)
