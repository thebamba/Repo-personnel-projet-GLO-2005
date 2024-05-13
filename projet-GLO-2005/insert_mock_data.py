import csv
import os
import pymysql
from dotenv import load_dotenv
from passlib.hash import sha256_crypt
from database import inserer_utilisateur
import random

load_dotenv()
connection = pymysql.connect(
    host=os.environ.get("Host"),
    port=int(os.environ.get("Port")),
    user=os.environ.get("User"),
    password=os.environ.get("Password"),
    db=os.environ.get("Database"),
    autocommit=True
)
cursor = connection.cursor()

def import_utilisateur_csv(file_path):
    with open(file_path) as f:
        reader = csv.reader(f)
        next(f)
        for line in reader:
            print(reader.line_num,'/201')
            inserer_utilisateur(prenom=line[0], nom=line[1], date_naissance=str(line[2]), email=line[3],
                                mot_de_passe=str(line[4]),droit_utilisateur=str(line[5]))



"""
def test():
    a = [9780000000001,9780000000819,9780000007803,9780000007804,9780000007800,9780000007814,9780000007805,9780000000011]
    pair = []
    for i in range(0, 100):
        pair.append((random.randint(1,44),random.randint(1,200)))
    return pair

def test2():
    pairs = test()

    # Convert list of tuples to set to remove duplicates and then back to list
    unique_pairs = list(set(pairs))

    # Sort the list to maintain order
    unique_pairs.sort()

    for pair in unique_pairs:
        print(pair,',')
"""

if __name__ == '__main__':
    import_utilisateur_csv("utilisateur.csv")
    #test()
    #test2()