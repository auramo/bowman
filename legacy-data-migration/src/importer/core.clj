(ns importer.core
  (:require [importer.expenses :as exp])
  (:require [cheshire.core :refer :all]))

(defn import
  []
  (println (generate-string (exp/load-expenses (exp/get-resourcefile-path "expensedb.dat")) {:pretty true}))
  (println "---")
  (println (generate-string (exp/get-payers)))
  (println "---")
  (println (generate-string (exp/get-types) {:pretty true})))

(defn -main []
  (import))
