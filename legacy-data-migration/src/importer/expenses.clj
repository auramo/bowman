(ns importer.expenses)

(use 'importer.date-util)

(defn get-resourcefile-path [filename]
  (str (System/getenv "RESOURCE_PATH") filename))

(defn load-resource [filename]
  (read-string (slurp (get-resourcefile-path filename))))

(defn get-payers []
   (load-resource "payers.dat"))

(defn get-types []
  (load-resource "payment_types.dat"))

(defn- expense-date-to-str [expense]
  (assoc expense :date (format-date (:date expense))))

(defn- expense-str-to-date [expense]
  (assoc expense :date (parse-date (:date expense))))

(defn expenses-str-to-date [expense-seq]
  (map expense-str-to-date expense-seq))

(defn cents-to-str [cents]
  (let [beginning (str (unchecked-divide-int cents 100) "," )
        cents-after-div (unchecked-remainder-int cents 100)]
    (if (< cents-after-div 10)
      (str beginning cents-after-div "0")
      (str beginning cents-after-div))))


(defn print-expenses [expenses]
  (doseq [expense expenses]
    (doseq [[key value] expense]
      (print (format "%10s: %s\n" (name key) value)))
    (println)))

(defn read-lines [file-name]
  (line-seq (clojure.java.io/reader file-name)))

(defn load-expense-seq [filename]
 "Loads expenses as a sequence from file"
 (map #(read-string %) (read-lines filename)))

(defn load-expenses [filename]
  (let [expense-seq (expenses-str-to-date (load-expense-seq filename))]
    (apply hash-map
           (interleave (map #(:id %) expense-seq) expense-seq))))
