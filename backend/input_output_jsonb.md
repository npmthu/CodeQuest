Example below: input has name nums and target

Allowed types (do not freestyle this)

Primitive:

int, float, string, bool, null


Containers:

array, object


Advanced (optional but inevitable):

tree, graph, linked_list

problem_io.input:
```json
{
  "style": "function",
  "params": [
    {
      "name": "nums",
      "type": "array",
      "element_type": "int",
      "constraints": {
        "min_length": 2,
        "max_length": 10000,
        "value_range": [-1000000000, 1000000000]
      }
    },
    {
      "name": "target",
      "type": "int",
      "constraints": {
        "value_range": [-1000000000, 1000000000]
      }
    }
  ]
}
```

problem_io.output:
```json
{
  "type": "array",
  "element_type": "int",
  "constraints": {
    "length": 2
  },
  "comparator": "exact"
}
```

testcases.input:
```json
{
  "nums": [2, 7, 11, 15],
  "target": 9
}

```

testcases.expected_output:
```json
[0, 1]
```
