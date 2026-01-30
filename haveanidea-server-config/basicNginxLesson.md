```nginx
events {
}

http {
  include mime.types;

  server {
    listen 8080;

    # root folder του project
    root C:/Users/Administrator/Desktop/test/learnNGINX;

    # αυτό κάνει routing του /
    location / {
      # αν δεν βρεθεί αρχείο → 404
      try_files $uri $uri/ =404;
    }

    # εχουμε βάλει το ίδιο με το root γιατι το location προσθέτει το δικό του απο μόνο του
    location /fruits {
      root C:/Users/Administrator/Desktop/test/learnNGINX;
    }

    location /carbs {
      # με το alias δεν κάνει append το / του location
      alias C:/Users/Administrator/Desktop/test/learnNGINX/fruits;
    }

    location /vegetables {
      root D:/coding/learnNGINX/;
      # είναι πιθανό το αρχείο που θέλω να τρέξω να μην είναι το index.html τότε του λέω try_files ποιο αρχείο να τρέξει, ποια είναι η εναλάκτική του και 404 αν δεν βρεί κανένα απο τα δύο
      try_files /vegetables/veggies.html /index.html =404;
    }

    # κανουμε redirect στο fruits. δηλ θα βλέω fruits και στο url
    location /crops {
      return 307 /fruits;
    }

    # με ~* βάλαμε regular expressions. τώρα θα σερβίρει και στα http://localhost:8080/count/5 την homepage
    location ~* /COUNT/[0-9] {
      root C:/Users/Administrator/Desktop/test/learnNGINX;
      try_files /index.html =404;
    }

    # rewrite: Directive του nginx για αλλαγή URL με regex.
    # ^ → αρχη, /literal this/, (\w+) → ενα ή περισσότερα γραμματα/αριθμοι
    # /count/$1; → βαλε εδω οτι έχει η πρώτη παρένθεση. πχ /number/3 → /count/3
    # αν πάω στο http://localhost:8080/number/3 αλλα θα μου δείχνει οτι είναι στο /count/3 διατηρόντας ομως το url number/3
    rewrite ^/number/(\w+) /count/$1;

  }
}
```