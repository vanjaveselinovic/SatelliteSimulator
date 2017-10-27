#! /usr/bin/env python2

import cgi
import cgitb
import time
import os
cgitb.enable()

hit_count_path = os.path.join(os.path.dirname(__file__), "hit-count.txt")
html_file_path = os.path.join(os.path.dirname(__file__), "htmlFile.html")

if os.path.isfile(hit_count_path):
  hit_count = int(open(hit_count_path).read())
  hit_count += 1
else:
  hit_count = 1

hit_counter_file = open(hit_count_path, 'w')
hit_counter_file.write(str(hit_count))
hit_counter_file.close()

if os.path.isfile(html_file_path):
  htmlFile = open(html_file_path).read()
else:
  htmlFile = "{0}, {1}"

header = "Content-type: text/html\n\n"


date_string = time.strftime('%A, %B %d, %Y at %I:%M:%S %p %Z')

html = htmlFile.format(cgi.escape(date_string), cgi.escape(str(hit_count)))

print header + html