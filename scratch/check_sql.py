import re

def count_values(line):
    # Very basic SQL value counter
    # Handles NULL, numbers, and 'strings' (basic)
    if 'VALUES' not in line: return 0
    values_part = line.split('VALUES')[1].strip()
    if values_part.startswith('('):
        values_part = values_part[1:-2] # remove (...) and ;
    
    # Split by comma but not inside quotes
    parts = []
    current = ""
    in_quote = False
    for char in values_part:
        if char == "'":
            in_quote = not in_quote
        if char == "," and not in_quote:
            parts.append(current.strip())
            current = ""
        else:
            current += char
    parts.append(current.strip())
    return len(parts)

with open('api/MASTER_DEPLOYMENT.sql', 'r') as f:
    content = f.read()

# Find all CREATE TABLE blocks
tables = re.findall(r'CREATE TABLE IF NOT EXISTS `(\w+)` \((.*?)\) ENGINE', content, re.DOTALL)

for table_name, table_body in tables:
    # Count columns in CREATE TABLE
    columns = re.findall(r'^\s+`(\w+)`', table_body, re.MULTILINE)
    col_count = len(columns)
    
    # Find first INSERT for this table
    insert_match = re.search(r'INSERT INTO ' + table_name + r' VALUES\((.*?)\);', content)
    if insert_match:
        val_count = count_values(insert_match.group(0))
        if col_count != val_count:
            print(f"Table {table_name}: Columns={col_count}, Values={val_count}")
        else:
            print(f"Table {table_name}: OK ({col_count})")
    else:
        print(f"Table {table_name}: No INSERT found (Columns={col_count})")
