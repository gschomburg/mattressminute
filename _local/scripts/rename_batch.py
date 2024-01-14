import os

def is_valid_id_prefix(id_prefix):
    try:
        # Check if the ID prefix is a valid four-digit number
        return len(id_prefix) == 5 and id_prefix[:-1].isdigit() and id_prefix[-1] == '_'
    except ValueError:
        return False
    
def rename_images(folder_path, start_id):
    # Initialize the ID counter
    id_counter = start_id

    for filename in os.listdir(folder_path):
        if filename.lower().endswith(".jpg"):
            image_path = os.path.join(folder_path, filename)

            # Extract file extension
            file_name, file_extension = os.path.splitext(filename)

            # Extract the existing ID prefix
            existing_id_prefix = file_name[:5]

            # Check if the file name already starts with an ID
            if is_valid_id_prefix(existing_id_prefix):
                # If it is, just skip this file
                print(f'Skipping: {filename}')
                continue

            # Create a padded ID with 4 digits
            padded_id = f"{id_counter:04d}"

            # Create the new filename by adding the padded ID and making it lowercase
            new_filename = f"{padded_id}_{file_name.lower()}{file_extension.lower()}"

            # Construct the new path
            new_path = os.path.join(folder_path, new_filename)

            # Rename the file
            os.rename(image_path, new_path)
            print(f'Renamed: {filename} to {new_filename}')

            # Increment the ID counter for the next file
            id_counter += 1

# Replace 'path/to/your/folder' with the actual path to your folder containing JPG images
input_folder = 'filtered'
start_index = 0

rename_images(input_folder, start_index)
