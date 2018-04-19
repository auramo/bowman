(ns importer.core
  (:require [importer.expenses :as exp])
  (:require [clojure.java.io :as io])
  (:require [cheshire.core :refer :all]))

(defn import
  []
  (let [expense-json "data-to-import/expenses.json"]
    (io/make-parents expense-json)
    (spit expense-json (generate-string (exp/load-expenses (exp/get-resourcefile-path "expensedb.dat")) {:pretty true}))
    (spit "data-to-import/payers.json" (generate-string (exp/get-payers)))
    (spit "data-to-import/payment-types.json" (generate-string (exp/get-types) {:pretty true}))
    (println "json files imported")))

(defn -main []
  (import))
