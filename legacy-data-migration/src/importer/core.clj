(ns importer.core
  (:require [importer.expenses :as exp]))

(defn foo
  []
  (println (exp/get-payers))
  (println "---")
  (println (exp/get-types))
  (println "---")  
  (println (exp/load-expenses (exp/get-resourcefile-path "expensedb.dat"))))

(defn -main []
  (foo))
