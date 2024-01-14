import os

def add_prefix_to_images(folder_path, prefix='t_'):
    for filename in os.listdir(folder_path):
        if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
            # Check if the filename already has the prefix
            if not filename.startswith(prefix):
                # Add the prefix to the filename
                new_filename = prefix + filename
                old_path = os.path.join(folder_path, filename)
                new_path = os.path.join(folder_path, new_filename)

                # Rename the file
                os.rename(old_path, new_path)
                print(f"Renamed: {filename} to {new_filename}")

# Specify the folder path
folder_path = '2024_01_12/thumbnails/'

# Call the function to add the prefix
add_prefix_to_images(folder_path)
