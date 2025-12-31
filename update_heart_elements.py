#!/usr/bin/env python3
"""Update character elements to 'heart' for specified characters"""

import json
import sys

# List of characters to update (name "version" format)
CHARACTERS_TO_UPDATE = [
    'Akatsuchi "Unyielding Stone"',
    'Anko Mitarashi "A Smile That Could Kill"',
    'Ashura "Devoted to Studies"',
    'Asuma Sarutobi "Final Words"',
    'Awakening Scroll "Heart Book"',
    'Chino "Ill-Omened Red Eyes"',
    'Chiriku "Ultimate Training"',
    'Chojuro "Slashing Twinsword"',
    'Danzo Shimura "Embodiment of Darkness"',
    'Darui "Words of Conviction"',
    'Deadly Beads "Devoted to Studies"',
    'Deadly Beads "Embodiment of Darkness"',
    'Deadly Beads "Final Words"',
    'Deadly Beads "Strength-Based Leadership"',
    'Deadly Beads "The Inheritor"',
    'Deidara "Ephemeral Art"',
    'Deidara "True Arts"',
    'Ferocious Beads "Devoted to Studies"',
    'Ferocious Beads "Embodiment of Darkness"',
    'Ferocious Beads "Final Words"',
    'Ferocious Beads "Strength-Based Leadership"',
    'Ferocious Beads "The Inheritor"',
    'Fourth Raikage: Ay "Savage Lightning"',
    'Gaara "The Strongest Shield"',
    'Gengetsu Hozuki "Mists Over the Darkness"',
    'Genma Shiranui "Always Aimless"',
    'Haku "The Icy Mask\'s Blades"',
    'Hashirama Senju "Long-Held Dream"',
    'Hashirama Senju "Sorrowful Parting"',
    'Heart "Ichiraku Ramen, Large"',
    'Heart "Ichiraku Ramen, Reg"',
    'Heart "Ichiraku Ramen, XL"',
    'Heart "Ichiraku Ramen, XXL"',
    'Heart Beads "Battle Heart Beads"',
    'Heart Beads "Light Heart Beads"',
    'Hiashi Hyuga "A Strict Leader"',
    'Hinata Hyuga "Blooming Talent"',
    'Hinata Hyuga "Loyal Emotions"',
    'Hinata Hyuga "Nice Girl"',
    'Hinata Hyuga "Path to the Ideal"',
    'Hinata Hyuga "Tug of the Heart Strings"',
    'Hiruzen Sarutobi "Ninja Clothes"',
    'Hiruzen Sarutobi "The Third Hokage"',
    'Indra "Strength-Based Leadership"',
    'Ino Yamanaka "Bittersweet Gift"',
    'Ino Yamanaka "Ever-Changing Movements"',
    'Ino Yamanaka "I Don\'t Want to Lose"',
    'Inoichi Yamanaka "The "Ino"-Shika-Cho Trio"',
    'Itachi Uchiha "Beyond the Sharingan"',
    'Itachi Uchiha "Eyes Which Weave Truth and Lies"',
    'Itachi Uchiha "Limits of his Ability"',
    'Itachi Uchiha "Talent and Burden"',
    'Itachi Uchiha "The Promised Day"',
    'Izumo Kamizuki "The Calm Proctor"',
    'Jiraiya "Enter the Sage"',
    'Jiraiya "Hidden Heart"',
    'Jirobo "Herculean Appetite"',
    'Kabuto Yakushi "Craving for Wisdom"',
    'Kaguya Otsutsuki "Divine Madness"',
    'Kaguya Otsutsuki "Truth Behind the Myth"',
    'Kakashi Hatake "A Father\'s Blade"',
    'Kakashi Hatake "Entrusted With Hope"',
    'Kankuro "Pride In His Work"',
    'Karin "With the Noble Taka"',
    'Kiba Inuzuka "Well-Honed Fangs"',
    'Kidomaru "A Cruel Game"',
    'Kidomaru "Solid Flexible Threads"',
    'Kimimaro "Kimimaro of the Earth"',
    'Konan "A Bridge to Hope"',
    'Kotetsu Hagane "The Deceptive Proctor"',
    'Kushimaru Kuriarare "Needle Blade"',
    'Kushina Uzumaki "Fist of Hidden Embarrassment"',
    'Leaf Anbu Female "Masked Ways"',
    'Leaf Anbu Male "The Hokage\'s Servant"',
    'Leaf Chunin Male "Supporter of the Tree"',
    'Madara Uchiha "The Vilest Name"',
    'Might Dai "Something to Protect"',
    'Minato Namikaze "Flash of the Battlefield"',
    'Minato Namikaze "Unfading Courage"',
    'Naruto Uzumaki "As a Friend"',
    'Naruto Uzumaki "Bewitching Transformation"',
    'Naruto Uzumaki "Beyond Rasen"',
    'Naruto Uzumaki "Day of Vows"',
    'Naruto Uzumaki "Endowed Power"',
    'Naruto Uzumaki "Name and Soul"',
    'Naruto Uzumaki "No. 1 Maverick"',
    'Naruto Uzumaki "Proof of Bonds"',
    'Naruto Uzumaki "Roaring Tears"',
    'Naruto Uzumaki "Shining Warrior of Bonds"',
    'Naruto Uzumaki "Taboo-Breaking Frustration"',
    'Naruto Uzumaki "The Inheritor"',
    'Naruto Uzumaki "The Worst Loser"',
    'Naruto Uzumaki "True Peace"',
    'Neji Hyuga "A Quiet Acumen"',
    'Obito Uchiha "Into Total Darkness"',
    'Obito Uchiha "Remnants of Despair"',
    'Obito Uchiha "The Final Destination"',
    'Orochimaru "Corrupt Rebirth"',
    'Orochimaru "Winds of Chaos"',
    'Pain (Chikushodo) "Glimpse of the Divine"',
    'Pain (Shurado) "Vessel of Madness"',
    'Pain (Tendo) "Dawn of Peace"',
    'Pain (Tendo) "Signal Flare of Revolution"',
    'Pain (Tendo) "Visage of Justice"',
    'Pakura "Scorching Red"',
    'Red Ring "Special Awakening Tool"',
    'Rin Nohara "Harboring Calamity"',
    'Rock Lee "A Genius of Hard Work"',
    'Sai "Ink Drawn from the Heart"',
    'Sakura Haruno "Back to Back"',
    'Sakura Haruno "Sandy Beach Dreams"',
    'Sakura Haruno "Unwavering Feelings"',
    'Sasuke Uchiha "Avenger"',
    'Sasuke Uchiha "Buried Past"',
    'Sasuke Uchiha "Desired Future"',
    'Sasuke Uchiha "Ready for the Curse Mark"',
    'Sasuke Uchiha "Wandering Swordsman"',
    'Shikamaru Nara "New Resolve"',
    'Shisui Uchiha "The Elite Who Makes His Mark"',
    'Shizune "Tsunade\'s Attendant"',
    'Tayuya "Tayuya of the North Gate"',
    'Temari "High Winds"',
    'Tenten "Battle Blade Dance"',
    'Tenzo (Yamato) "Beneath the Sun"',
    'Tobirama Senju "Quiet Fighting Spirit"',
    'Torune Aburame "Lurking Poison"',
    'Tsunade "Inherited Dream"',
    'Tsunade "The Slug Ninja"',
    'Ultimate Treasure Chest "True Heart Treasure"',
    'Yugito Ni\'i "Unbreakable Will"',
    'Zabuza Momochi "The Measure of a Demon"',
    'Zabuza Momochi "Unbounded Dread"',
    'Zaku Abumi "The Confident One"',
    'Zori "Bodyguard w/Hat"',
]

def parse_character_entry(entry):
    """Parse 'Name "Version"' format into (name, version)"""
    if '"' not in entry:
        return (entry.strip(), None)

    # Split on first quote
    parts = entry.split('"', 1)
    name = parts[0].strip()
    version = parts[1].rstrip('"').strip() if len(parts) > 1 else None
    return (name, version)

def main():
    # Load characters.json
    with open('data/characters.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Parse character list into (name, version) tuples
    characters_to_update = set()
    for entry in CHARACTERS_TO_UPDATE:
        name, version = parse_character_entry(entry)
        characters_to_update.add((name, version))

    # Update characters
    updated_count = 0
    not_found = []

    for char in data:
        char_name = char.get('name', '')
        char_version = char.get('version', '')

        if (char_name, char_version) in characters_to_update:
            old_element = char.get('element', 'N/A')
            char['element'] = 'heart'
            updated_count += 1
            print(f"✓ Updated: {char_name} \"{char_version}\" ({old_element} → heart)")

    # Check for characters that weren't found
    found_characters = set()
    for char in data:
        found_characters.add((char.get('name', ''), char.get('version', '')))

    for name, version in characters_to_update:
        if (name, version) not in found_characters:
            not_found.append(f'{name} "{version}"')

    # Save updated JSON
    with open('data/characters.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # Summary
    print(f"\n{'='*60}")
    print(f"Updated {updated_count} characters to element 'heart'")

    if not_found:
        print(f"\nWarning: {len(not_found)} characters not found:")
        for name in not_found[:10]:  # Show first 10
            print(f"  - {name}")
        if len(not_found) > 10:
            print(f"  ... and {len(not_found) - 10} more")

    print(f"{'='*60}")
    return 0

if __name__ == '__main__':
    sys.exit(main())
