def decode_letter(letter: str, key: str):
    if letter.islower():
        return chr((ord(letter) - ord(key)) % 26 + ord('a'))
    return chr((ord(letter) - ord(key)) % 26 + ord('A'))


def restart_per_word(key: str, cipher_text: str):
    cipher_words = cipher_text.split()
    plain_text = ""
    for word in cipher_words:
        for i, letter in enumerate(word):
            if letter.isalpha():
                plain_text += decode_letter(letter, key[i % len(key)])
            else:
                plain_text += letter
        plain_text += " "
    return plain_text


def main():
    cipher_text = "Rc qipv jhx vld plson fhceuh itp jui gh qhzu dg sq xie dhw. U gbfl lf fluz pcag wrgkv zw, " \
                  "dinyg zw, qge gnvm L fhx. "
    with open('potential_keys.txt', 'r') as file_in:
        keys = file_in.readlines()
        for key in keys:
            key = key.strip()
            print(restart_per_word(key, cipher_text), "Key: ", key)


if __name__ == "__main__":
    main()
