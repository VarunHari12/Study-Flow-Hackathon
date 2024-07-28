input_file = 'test.txt'
output_file = 'test2.txt'

with open(input_file, 'r') as file:
    lines = file.readlines()

modified_lines = []
for line in lines:
    index = line.find('<s>')
    if index != -1:
        modified_line = line[:index].lstrip('.1234567890 ')
        modified_line += line[index:]
        modified_lines.append(modified_line)
    else:
        modified_lines.append(line)

with open(output_file, 'w') as file:
    file.writelines(modified_lines)

print(f"Processed content written to {output_file}")
