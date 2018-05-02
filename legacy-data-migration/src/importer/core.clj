(ns importer.core
  (:require [importer.expenses :as exp])
  (:require [clojure.java.io :as io])
  (:require [cheshire.core :refer :all]))

(defn import
  [data-dir]
  (let [expense-json (str data-dir "/" "expenses.json")]
    (io/make-parents expense-json)
    (spit expense-json (generate-string (exp/load-expenses (exp/get-resourcefile-path "expensedb.dat")) {:pretty true}))
    (spit (str data-dir "/" "payers.json") (generate-string (exp/get-payers)))
    (spit (str data-dir "/" "payment-types.json") (generate-string (exp/get-types) {:pretty true}))
    (println "json files imported")))

(defn -main [& args]
  (when (< (count args) 1)
    (println "Give data directory as parameter")
    (System/exit 1))
  (import (first args)))
