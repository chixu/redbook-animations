import subprocess
import os

folder_path = f"../out/"
# 1. List of your video files
video_files = [
    "FlashCardScene0.mp4", 
    "FlashCardScene1.mp4", 
    "FlashCardScene2.mp4"
    ]
output_file = f"{folder_path}merged_seamless.mp4"

# 2. Create a temporary text file listing the videos (required by FFmpeg demuxer)
list_filename = "mylist.txt"
with open(list_filename, "w") as f:
    for video in video_files:
        # FFmpeg requires paths to be formatted as: file 'path/to/file.mp4'
        print(f"file '{folder_path}{video}'\n")
        f.write(f"file '{folder_path}{video}'\n")

# 3. Build the FFmpeg command
# -f concat: Use the concat demuxer
# -safe 0: Allow unsafe file paths (useful if you use absolute paths)
# -c copy: VITAL! Copies stream directly without re-encoding (seamless & fast)
cmd = [
    "ffmpeg",
    "-f", "concat",
    "-safe", "0",
    "-i", list_filename,
    "-c", "copy",
    output_file,
    "-y" # Overwrite output if it exists
]

# 4. Run the command
try:
    print("Merging videos...")
    subprocess.run(cmd, check=True)
    print(f"Success! Saved to {output_file}")
except subprocess.CalledProcessError as e:
    print("Error during merging:", e)
finally:
    # 5. Cleanup temporary list file
    if os.path.exists(list_filename):
        os.remove(list_filename)