<?php
/**
 * Advanced Input Validator
 */
class Validator {
    private $errors = [];

    public function validate($data, $rules) {
        foreach ($rules as $field => $fieldRules) {
            $value = isset($data[$field]) ? $data[$field] : null;

            foreach ($fieldRules as $rule => $ruleValue) {
                if ($rule === 'required' && $ruleValue && ($value === null || $value === '')) {
                    $this->addError($field, "The $field field is required.");
                    break; // Skip other rules if required field is missing
                }

                if ($value !== null && $value !== '') {
                    switch ($rule) {
                        case 'type':
                            $this->validateType($field, $value, $ruleValue);
                            break;
                        case 'min_length':
                            if (strlen($value) < $ruleValue) {
                                $this->addError($field, "The $field must be at least $ruleValue characters.");
                            }
                            break;
                        case 'max_length':
                            if (strlen($value) > $ruleValue) {
                                $this->addError($field, "The $field must not exceed $ruleValue characters.");
                            }
                            break;
                        case 'email':
                            if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                                $this->addError($field, "The $field must be a valid email address.");
                            }
                            break;
                        case 'date':
                            $d = DateTime::createFromFormat('Y-m-d', $value);
                            if (!$d || $d->format('Y-m-d') !== $value) {
                                $this->addError($field, "The $field must be a valid date in YYYY-MM-DD format.");
                            }
                            break;
                        case 'in':
                            if (!in_array($value, $ruleValue)) {
                                $this->addError($field, "The $field must be one of: " . implode(', ', $ruleValue));
                            }
                            break;
                    }
                }
            }
        }

        return empty($this->errors);
    }

    private function validateType($field, $value, $type) {
        switch ($type) {
            case 'string':
                if (!is_string($value)) $this->addError($field, "The $field must be a string.");
                break;
            case 'integer':
            case 'int':
                if (!filter_var($value, FILTER_VALIDATE_INT)) $this->addError($field, "The $field must be an integer.");
                break;
            case 'numeric':
                if (!is_numeric($value)) $this->addError($field, "The $field must be numeric.");
                break;
            case 'array':
                if (!is_array($value)) $this->addError($field, "The $field must be an array.");
                break;
        }
    }

    private function addError($field, $message) {
        if (!isset($this->errors[$field])) {
            $this->errors[$field] = [];
        }
        $this->errors[$field][] = $message;
    }

    public function getErrors() {
        return $this->errors;
    }

    public function sendErrors() {
        sendResponse(false, 'Validation failed', ['errors' => $this->errors]);
    }
}
?>
