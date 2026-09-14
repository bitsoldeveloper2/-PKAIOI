import type { CourseLevel, CourseStatus, LessonType } from "../../src/generated/prisma/enums";

export type SeedLesson = {
  title: string;
  type: LessonType;
  durationMinutes: number;
  content: string;
  videoUrl?: string;
  isPreview?: boolean;
  quiz?: { questions: { id: string; prompt: string; options: string[]; answer: number; explanation: string }[] };
  lab?: { language: "python" | "javascript"; starterCode: string; hint?: string; tests: { name: string; code: string }[] };
};

export type SeedCourse = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  level: CourseLevel;
  category: string;
  durationHours: number;
  accent: string;
  status?: CourseStatus;
  publishedDaysAgo?: number;
  featured?: boolean;
  tags: string[];
  learningOutcomes: string[];
  prerequisites: string[];
  instructorKey: string;
  programSlug?: string;
  modules: { title: string; summary?: string; lessons: SeedLesson[] }[];
};

const SAMPLE_VIDEO = "/media/sample-lecture.webm";

export const courses: SeedCourse[] = [
  // ───────────────────────────────────────────────────────────────────────
  {
    slug: "foundations-of-machine-learning",
    title: "Foundations of Machine Learning",
    subtitle: "From first principles to a model you can defend",
    description: `Machine learning is a discipline of judgement disguised as a discipline of code. This course builds the judgement first: what it means for a model to generalise, why validation is the whole game, and how the classical algorithms encode different assumptions about the world.

You will implement linear and logistic regression from scratch, train tree ensembles on a real Pakistani public-health dataset, and finish with an error analysis you would be comfortable presenting to a sceptical stakeholder.

Every module ends with a graded quiz or a lab that runs in your browser — no environment setup required.`,
    level: "BEGINNER",
    category: "Machine Learning",
    durationHours: 22,
    accent: "jade",
    featured: true,
    publishedDaysAgo: 120,
    tags: ["supervised learning", "validation", "scikit-learn", "python"],
    learningOutcomes: [
      "Frame a business or research question as a learning problem with a measurable objective.",
      "Implement gradient descent and understand what loss functions encode.",
      "Choose and justify validation strategies that reflect how the model will be used.",
      "Diagnose underfitting, overfitting and leakage with error analysis.",
    ],
    prerequisites: ["Basic Python (variables, functions, lists)", "Secondary-school algebra"],
    instructorKey: "ayesha",
    programSlug: "foundations-of-ai-and-data",
    modules: [
      {
        title: "Learning from data",
        summary: "What a model is, what it is not, and why generalisation is the only thing that matters.",
        lessons: [
          {
            title: "Why prediction is hard",
            type: "VIDEO",
            durationMinutes: 14,
            isPreview: true,
            videoUrl: SAMPLE_VIDEO,
            content: `## Why prediction is hard

Every model is a compression of the past into a rule about the future. The rule is only useful if the future resembles the past in the ways the rule depends on — and it is remarkable how often it does not.

In this opening lecture we look at three real failures:

1. **A credit model** that learned the branch code instead of the borrower.
2. **A crop-yield model** that performed beautifully in validation and collapsed the year the monsoon shifted by three weeks.
3. **A hospital triage model** that learned that patients with asthma had *better* outcomes — because they were sent straight to intensive care.

Each failure has the same shape: the model found a pattern that was true in the data and false in the world. Learning to see this shape early is most of what separates a practitioner from a hobbyist.

### What to take from this lesson

- Data is a **sample** from a process; the process is what you care about.
- A model that fits the sample perfectly has told you nothing about the process.
- Validation is not a formality. It is the experiment that tests your claim.

> “All models are wrong, but some are useful.” — George Box. The practitioner’s job is to find out *how* wrong, *where*, and *whether anyone will get hurt*.`,
          },
          {
            title: "Vocabulary you will use every day",
            type: "ARTICLE",
            durationMinutes: 12,
            content: `## Vocabulary you will use every day

The field has an unfortunate habit of using five words for the same thing. This lesson fixes a working vocabulary for the course.

| Term | Meaning | Also called |
| --- | --- | --- |
| **Feature** | An input variable the model sees | attribute, predictor, column |
| **Label** | The value we want to predict | target, outcome, response |
| **Example** | One row: features plus (in training) a label | instance, sample, observation |
| **Training set** | Examples the model learns from | — |
| **Validation set** | Examples used to choose between models | dev set, hold-out |
| **Test set** | Examples touched exactly once, at the end | — |
| **Loss** | A number measuring how wrong a prediction is | cost, objective |
| **Generalisation** | Performance on examples the model has not seen | out-of-sample performance |

### Supervised, unsupervised, reinforcement

- **Supervised** learning has labels. Predicting house prices, classifying X-rays.
- **Unsupervised** learning has no labels. Grouping customers, compressing images.
- **Reinforcement** learning has rewards that arrive late. Playing games, controlling a robot.

This course is almost entirely about supervised learning, because it is where most applied value lives and where the ideas transfer most cleanly.

### A note on notation

We write a dataset as pairs \\((x_i, y_i)\\) for \\(i = 1 \\dots n\\). A model is a function \\(f\\) with parameters \\(\\theta\\); it produces a prediction \\(\\hat{y} = f(x; \\theta)\\). Learning means choosing \\(\\theta\\) to make \\(\\hat{y}\\) close to \\(y\\) on data the model has not seen.

You do not need to be fluent in this notation to pass the course, but you will meet it in every paper you read afterwards, so we use it from the start.`,
          },
          {
            title: "Check your understanding",
            type: "QUIZ",
            durationMinutes: 8,
            content: "Five questions on the ideas from the first two lessons. You can retake this as many times as you like; only your best score counts.",
            quiz: {
              questions: [
                {
                  id: "q1",
                  prompt: "A model scores 99% on the data it was trained on and 62% on new data. What is the most likely explanation?",
                  options: ["The new data is corrupted", "The model has overfit the training data", "The model needs more parameters", "The loss function is wrong"],
                  answer: 1,
                  explanation: "A large gap between training and unseen performance is the signature of overfitting: the model memorised patterns specific to the sample.",
                },
                {
                  id: "q2",
                  prompt: "Which set should be touched exactly once, at the very end of a project?",
                  options: ["Training set", "Validation set", "Test set", "Feature set"],
                  answer: 2,
                  explanation: "Every time you look at the test set and change something, it stops being a fair test. Reserve it for the final measurement.",
                },
                {
                  id: "q3",
                  prompt: "The triage model that learned asthma patients had better outcomes is an example of…",
                  options: ["Insufficient data", "A pattern true in the data but false in the world", "A bug in the training code", "An unsupervised learning problem"],
                  answer: 1,
                  explanation: "The correlation was real in the historical records because asthma patients received more aggressive care — the model would have recommended the opposite.",
                },
                {
                  id: "q4",
                  prompt: "Predicting whether a transaction is fraudulent from labelled historical transactions is…",
                  options: ["Supervised learning", "Unsupervised learning", "Reinforcement learning", "Not machine learning"],
                  answer: 0,
                  explanation: "There is a label (fraud or not) for each example, so this is supervised classification.",
                },
                {
                  id: "q5",
                  prompt: "In the notation used in this course, what does θ (theta) represent?",
                  options: ["The input features", "The label", "The model’s parameters", "The size of the dataset"],
                  answer: 2,
                  explanation: "θ is the set of numbers the learning algorithm adjusts. Learning is the search for good values of θ.",
                },
              ],
            },
          },
        ],
      },
      {
        title: "Linear models and optimisation",
        summary: "Build regression from scratch so that every later model feels familiar.",
        lessons: [
          {
            title: "Linear regression by hand",
            type: "VIDEO",
            durationMinutes: 18,
            videoUrl: SAMPLE_VIDEO,
            content: `## Linear regression by hand

We start with the simplest model that is still genuinely useful: a straight line.

Given features \\(x\\) and a label \\(y\\), linear regression assumes \\(y \\approx w x + b\\). The parameters are \\(\\theta = (w, b)\\). The loss is the mean squared error:

\`\`\`
MSE(w, b) = (1/n) · Σ (y_i − (w·x_i + b))²
\`\`\`

### Why squared error?

Squaring makes large mistakes cost disproportionately more, which is often what we want, and it makes the loss smooth, which makes optimisation easy. It also corresponds to assuming the noise around the line is Gaussian — an assumption you should remember you made.

### Solving it

There are two ways to find the best line:

1. **Closed form.** Set the derivative to zero and solve. Works for linear regression; does not generalise.
2. **Gradient descent.** Start anywhere, compute the slope of the loss, take a small step downhill, repeat. Works for almost everything.

In the video we do both, and we watch gradient descent converge from a bad starting guess in about forty steps.

### The learning rate

The step size — the *learning rate* — is the first hyperparameter you will ever tune. Too small and training crawls; too large and it diverges. We show both failure modes on screen.`,
          },
          {
            title: "Lab · Implement gradient descent",
            type: "LAB",
            durationMinutes: 35,
            content: `## Lab · Implement gradient descent

Implement \`fit_line(xs, ys, lr=0.01, steps=2000)\` that returns \`(w, b)\` for the least-squares line through the points, found by gradient descent.

**Gradient reminders.** For mean squared error:

- \`dw = (2/n) · Σ (ŷ_i − y_i) · x_i\`
- \`db = (2/n) · Σ (ŷ_i − y_i)\`

Update with \`w -= lr * dw\` and \`b -= lr * db\`.

The tests check that your line recovers \`w ≈ 2, b ≈ 1\` from noiseless data and that it converges on a second, noisier set. Run your code as often as you like; submit when the tests pass.

Ask the tutor in the side panel if you get stuck — it can see this brief and your code.`,
            lab: {
              language: "python",
              starterCode: `def fit_line(xs, ys, lr=0.01, steps=2000):
    """Return (w, b) minimising mean squared error via gradient descent."""
    w, b = 0.0, 0.0
    n = len(xs)
    for _ in range(steps):
        # TODO: compute predictions, gradients dw and db, then update w and b
        pass
    return w, b


if __name__ == "__main__":
    xs = [0, 1, 2, 3, 4]
    ys = [1, 3, 5, 7, 9]
    print(fit_line(xs, ys))
`,
              hint: "Compute the residuals ŷ − y once per step, then reuse them for both gradients.",
              tests: [
                { name: "recovers w=2, b=1 on a perfect line", code: "w, b = fit_line([0,1,2,3,4], [1,3,5,7,9])\nassert abs(w - 2) < 0.05, f'w={w}'\nassert abs(b - 1) < 0.1, f'b={b}'" },
                { name: "handles noisy data", code: "w, b = fit_line([0,1,2,3,4,5], [0.9,3.2,4.8,7.1,9.05,10.9])\nassert abs(w - 2) < 0.2, f'w={w}'\nassert abs(b - 1) < 0.4, f'b={b}'" },
                { name: "returns a tuple of two floats", code: "res = fit_line([0,1],[0,1])\nassert isinstance(res, tuple) and len(res) == 2" },
              ],
            },
          },
          {
            title: "Logistic regression and decision boundaries",
            type: "ARTICLE",
            durationMinutes: 16,
            content: `## Logistic regression and decision boundaries

Classification asks a different question: not *how much* but *which*. Logistic regression keeps the linear machinery and adds one function, the sigmoid, that squashes any real number into a probability:

\`\`\`
σ(z) = 1 / (1 + e^(−z))      where z = w·x + b
\`\`\`

The model predicts \\(P(y = 1 \\mid x) = \\sigma(w \\cdot x + b)\\). The *decision boundary* is where this probability equals 0.5 — where \\(z = 0\\) — a straight line (or a flat plane in more dimensions).

### The right loss

Squared error is a poor fit for probabilities. We use **log loss** (binary cross-entropy):

\`\`\`
L = −(1/n) · Σ [ y_i · log(p_i) + (1 − y_i) · log(1 − p_i) ]
\`\`\`

It punishes confident wrong answers severely, which is exactly the behaviour you want from a classifier that will be trusted.

### Reading the coefficients

Because \\(z\\) is linear, each weight \\(w_j\\) has an interpretation: a one-unit increase in feature \\(j\\) multiplies the *odds* by \\(e^{w_j}\\). This is why logistic regression remains the default in medicine and credit — it can be audited.

### Thresholds are a product decision

A 0.5 threshold is arbitrary. A fraud team may act at 0.2 and a loan officer at 0.8. Decide the threshold with the people who own the consequences, using the precision–recall trade-off we cover in the next module.`,
          },
        ],
      },
      {
        title: "Validation and error analysis",
        summary: "The part that separates a demo from a deployment.",
        lessons: [
          {
            title: "Cross-validation done honestly",
            type: "VIDEO",
            durationMinutes: 17,
            videoUrl: SAMPLE_VIDEO,
            content: `## Cross-validation done honestly

A single train/test split is one experiment. \\(k\\)-fold cross-validation runs \\(k\\) experiments and reports the spread, which is far more informative than a point estimate.

But the *way* you split has to mirror how the model will be used:

- **Random split** — fine for independent examples.
- **Grouped split** — when several rows belong to one patient, customer or device, keep the whole group on one side. Otherwise you are testing memorisation.
- **Time-based split** — when the model will predict the future, validate on the future. Random splits leak tomorrow into today.

In the lecture we take a real dataset with repeated patients and show the cross-validated accuracy drop from 94% (random) to 71% (grouped). The second number is the true one.

### Leakage, the silent killer

Leakage is any information in training that will not be available at prediction time. Classic sources:

- Target-derived features (“account closed” when predicting churn).
- Preprocessing fit on the full dataset (scaling, imputation, vocabulary).
- Duplicates across splits.

The fix is discipline: every transformation lives inside the cross-validation loop.`,
          },
          {
            title: "Metrics that match the decision",
            type: "ARTICLE",
            durationMinutes: 14,
            content: `## Metrics that match the decision

Accuracy is the first metric everyone learns and the last one you should report alone. With 1% fraud, a model that says “never fraud” is 99% accurate and completely useless.

### The confusion matrix

|  | Predicted positive | Predicted negative |
| --- | --- | --- |
| **Actually positive** | True positive (TP) | False negative (FN) |
| **Actually negative** | False positive (FP) | True negative (TN) |

From it:

- **Precision** = TP / (TP + FP) — of the alarms we raised, how many were real?
- **Recall** = TP / (TP + FN) — of the real cases, how many did we catch?
- **F1** — the harmonic mean, when you need one number and both matter.

### Choosing

Ask what each error costs. Missing a tumour costs more than an unnecessary follow-up scan: favour recall. Blocking a legitimate payment annoys a customer, a fraudulent one loses money: the answer depends on amounts. Write the costs down; the metric follows.

### Calibration

A model that says “70%” should be right about 70% of the time. Reliability diagrams reveal when it is not, and calibration fixes are cheap. For any model whose probabilities will be *used* (pricing, triage, ranking), calibration matters as much as ranking quality.

### ROC and PR curves

Both show performance across all thresholds. Prefer the precision–recall curve when positives are rare; ROC curves flatter models on imbalanced data.`,
          },
          {
            title: "Module quiz · Validation",
            type: "QUIZ",
            durationMinutes: 8,
            content: "Test yourself on validation strategy, leakage and metrics.",
            quiz: {
              questions: [
                {
                  id: "v1",
                  prompt: "You are predicting next month’s electricity demand from historical data. Which validation split is appropriate?",
                  options: ["Random k-fold", "Time-based split", "Grouped by weekday", "Stratified by demand"],
                  answer: 1,
                  explanation: "The model will predict the future, so validation must too. Random splits leak future information into training.",
                },
                {
                  id: "v2",
                  prompt: "Fitting a feature scaler on the entire dataset before splitting is an example of…",
                  options: ["Regularisation", "Data leakage", "Stratification", "Calibration"],
                  answer: 1,
                  explanation: "The scaler’s statistics include the test data, so the test is no longer independent.",
                },
                {
                  id: "v3",
                  prompt: "For a rare-disease screening model where missing a case is very costly, which metric should you prioritise?",
                  options: ["Accuracy", "Precision", "Recall", "Specificity"],
                  answer: 2,
                  explanation: "Recall measures the share of true cases caught. High recall means few missed cases.",
                },
                {
                  id: "v4",
                  prompt: "A model outputs 0.9 for 1,000 patients and 600 of them have the condition. The model is…",
                  options: ["Well calibrated", "Over-confident", "Under-confident", "Perfectly accurate"],
                  answer: 1,
                  explanation: "It claims 90% but is right 60% of the time — over-confident. Calibration would correct the probabilities.",
                },
              ],
            },
          },
        ],
      },
      {
        title: "Trees, ensembles and a real project",
        summary: "The workhorses of tabular machine learning, and a project that ties everything together.",
        lessons: [
          {
            title: "Decision trees and random forests",
            type: "VIDEO",
            durationMinutes: 16,
            videoUrl: SAMPLE_VIDEO,
            content: `## Decision trees and random forests

A decision tree asks a sequence of yes/no questions about features until it reaches a leaf with a prediction. Trees are easy to read and dangerously easy to overfit: a deep enough tree memorises any dataset.

**Random forests** fix this by growing hundreds of trees, each on a bootstrap sample of the rows and a random subset of the features, and averaging their votes. Individually noisy, collectively stable — the same reason a crowd’s guess of a jar of sweets beats most individuals.

### What to tune

- \`n_estimators\` — more trees, diminishing returns after a few hundred.
- \`max_depth\` / \`min_samples_leaf\` — control individual tree complexity.
- \`max_features\` — how many features each split may consider; lower means more diversity.

### Feature importance, carefully

Forests report which features reduced impurity most. This is *not* causal and it is biased toward high-cardinality features. Prefer permutation importance on the validation set when the answer matters.`,
          },
          {
            title: "Gradient boosting in practice",
            type: "ARTICLE",
            durationMinutes: 15,
            content: `## Gradient boosting in practice

Where a forest averages independent trees, **boosting** builds them in sequence, each correcting the errors of the last. Libraries such as LightGBM and XGBoost make this fast enough that boosted trees win most tabular competitions and most tabular production systems.

### Key ideas

- Each new tree fits the *residuals* (the gradient of the loss) of the current ensemble.
- A small **learning rate** shrinks each tree’s contribution; more trees compensate.
- **Early stopping** on a validation set is the most important regulariser.

### Sensible defaults

\`\`\`python
import lightgbm as lgb

model = lgb.LGBMClassifier(
    n_estimators=2000,
    learning_rate=0.03,
    num_leaves=31,
    subsample=0.8,
    colsample_bytree=0.8,
)
model.fit(X_train, y_train, eval_set=[(X_val, y_val)], callbacks=[lgb.early_stopping(100)])
\`\`\`

### When boosting is the wrong tool

- Very small datasets (a few hundred rows): logistic regression is often better and always more honest.
- When you must explain individual decisions to a regulator: use monotonic constraints, or a simpler model.
- Images, audio, text: use the representations neural networks learn — covered in *Deep Learning in Practice*.`,
          },
          {
            title: "Project brief · Maternal health risk",
            type: "ARTICLE",
            durationMinutes: 20,
            content: `## Project · Maternal health risk classification

You will build and validate a model that classifies maternal health risk (low / mid / high) from six clinical measurements collected at rural health centres in Punjab. The dataset has 1,014 records and is provided under an open licence in the project workspace.

### Deliverables

1. **A notebook** with exploratory analysis, a validation plan that justifies its split strategy, at least two model families compared, and an error analysis of the worst mistakes.
2. **A one-page memo** to a district health officer: what the model does, how well, where it fails, and what you would need to trust it in a clinic.
3. **A five-minute recorded walk-through** of your notebook.

### Grading

| Criterion | Weight |
| --- | --- |
| Validation is honest and justified | 35% |
| Model quality relative to a sensible baseline | 20% |
| Error analysis finds something real | 25% |
| Memo is clear to a non-technical reader | 20% |

Submit through the project workspace before the module deadline. Faculty feedback arrives within five working days.`,
          },
          {
            title: "Final assessment",
            type: "QUIZ",
            durationMinutes: 12,
            content: "Eight questions spanning the whole course. A score of 70% or higher, together with the lab and project, completes the course and issues your certificate.",
            quiz: {
              questions: [
                { id: "f1", prompt: "Which regulariser matters most when training gradient-boosted trees?", options: ["Dropout", "Early stopping on a validation set", "Weight decay", "Batch normalisation"], answer: 1, explanation: "Boosting keeps improving on training data; early stopping halts when validation loss stops improving." },
                { id: "f2", prompt: "Random forests reduce overfitting mainly by…", options: ["Using deeper trees", "Averaging many decorrelated trees", "Removing features", "Increasing the learning rate"], answer: 1, explanation: "Bootstrap samples and random feature subsets decorrelate the trees; averaging reduces variance." },
                { id: "f3", prompt: "The sigmoid function is used in logistic regression to…", options: ["Speed up training", "Map any real number to a probability", "Reduce the number of features", "Compute the gradient"], answer: 1, explanation: "σ(z) squashes z into (0, 1), which we interpret as P(y = 1 | x)." },
                { id: "f4", prompt: "Which statement about feature importance from a random forest is true?", options: ["It proves causation", "It is unbiased across feature types", "It is biased toward high-cardinality features", "It equals the model’s accuracy"], answer: 2, explanation: "Impurity-based importance favours features with many possible split points. Permutation importance is more reliable." },
                { id: "f5", prompt: "When positives are rare, which curve gives the more honest picture?", options: ["ROC curve", "Precision–recall curve", "Learning curve", "Calibration curve"], answer: 1, explanation: "ROC curves are dominated by the many true negatives; PR curves focus on the positives you care about." },
                { id: "f6", prompt: "Several rows per patient in your data. To validate honestly you should…", options: ["Shuffle and split randomly", "Keep each patient entirely in one split", "Drop duplicate rows", "Use accuracy instead of F1"], answer: 1, explanation: "Grouped splits prevent the model from recognising a patient it has already seen." },
                { id: "f7", prompt: "A learning rate that is too large causes gradient descent to…", options: ["Converge slowly", "Diverge or oscillate", "Find the global minimum", "Overfit"], answer: 1, explanation: "Large steps overshoot the minimum and the loss can grow without bound." },
                { id: "f8", prompt: "The most important question to ask before choosing a metric is…", options: ["Which metric is most popular?", "What does each kind of error cost?", "Which metric is easiest to compute?", "Which metric does scikit-learn default to?"], answer: 1, explanation: "Metrics encode costs. Decide the costs with the people who own the consequences." },
              ],
            },
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  {
    slug: "python-for-ai-engineers",
    title: "Python for AI Engineers",
    subtitle: "The 20% of Python that does 90% of the work",
    description: `Not a general Python course. This is the Python you actually write when you build models: clean functions, numerical arrays, dataframes, generators for large data, tests, and the packaging habits that keep a notebook from becoming a liability.

The labs run in your browser. By the end you will have a small, tested toolkit you will reuse in every later course.`,
    level: "BEGINNER",
    category: "Engineering",
    durationHours: 14,
    accent: "gold",
    publishedDaysAgo: 140,
    tags: ["python", "numpy", "pandas", "testing"],
    learningOutcomes: [
      "Write idiomatic, readable Python with functions, comprehensions and type hints.",
      "Manipulate numerical data with NumPy broadcasting and pandas groupby.",
      "Structure a small project with modules, tests and a reproducible environment.",
    ],
    prerequisites: ["No prior programming required"],
    instructorKey: "usman",
    programSlug: "foundations-of-ai-and-data",
    modules: [
      {
        title: "Core language",
        lessons: [
          {
            title: "Functions, collections and truthiness",
            type: "ARTICLE",
            durationMinutes: 15,
            isPreview: true,
            content: `## Functions, collections and truthiness

Python rewards small functions with clear inputs and outputs. Three habits pay off immediately:

1. **Return, don’t print.** Functions that return values can be tested and composed.
2. **Use the right collection.** Lists for order, sets for membership, dicts for lookup, tuples for fixed records.
3. **Lean on truthiness carefully.** Empty collections are falsy; \`0\` and \`None\` are falsy; be explicit when it matters (\`if x is None\`).

\`\`\`python
def mean(values: list[float]) -> float:
    if not values:
        raise ValueError("mean of empty list")
    return sum(values) / len(values)
\`\`\`

### Comprehensions

\`\`\`python
squares = [x * x for x in range(10) if x % 2 == 0]
by_name = {u.name: u for u in users}
\`\`\`

They read as sentences: *the square of x, for each even x under ten*. Reach for a loop when the comprehension stops reading like a sentence.`,
          },
          {
            title: "Lab · Descriptive statistics toolkit",
            type: "LAB",
            durationMinutes: 30,
            content: `## Lab · Descriptive statistics toolkit

Implement three functions without importing any statistics library:

- \`mean(values)\` — arithmetic mean; raise \`ValueError\` on an empty list.
- \`median(values)\` — middle value, or the average of the two middle values.
- \`variance(values)\` — population variance (divide by \`n\`).

Keep the functions pure and readable. The tests check the numbers and the empty-list behaviour.`,
            lab: {
              language: "python",
              starterCode: `def mean(values):
    raise NotImplementedError


def median(values):
    raise NotImplementedError


def variance(values):
    raise NotImplementedError
`,
              hint: "Sort a copy of the list for the median; do not mutate the caller's data.",
              tests: [
                { name: "mean of [1, 2, 3, 4] is 2.5", code: "assert mean([1, 2, 3, 4]) == 2.5" },
                { name: "median of odd and even lengths", code: "assert median([3, 1, 2]) == 2\nassert median([4, 1, 3, 2]) == 2.5" },
                { name: "variance of [2, 4, 4, 4, 5, 5, 7, 9] is 4", code: "assert abs(variance([2, 4, 4, 4, 5, 5, 7, 9]) - 4) < 1e-9" },
                { name: "mean of empty list raises ValueError", code: "try:\n    mean([])\n    raise AssertionError('expected ValueError')\nexcept ValueError:\n    pass" },
              ],
            },
          },
          {
            title: "Errors, files and context managers",
            type: "ARTICLE",
            durationMinutes: 12,
            content: `## Errors, files and context managers

Good error handling is mostly about *not* catching. Catch the specific exception you can actually handle; let everything else propagate with its traceback intact.

\`\`\`python
try:
    value = int(text)
except ValueError:
    value = None
\`\`\`

### Files

Always open files with \`with\`, which closes them even when something goes wrong:

\`\`\`python
from pathlib import Path

rows = Path("data.csv").read_text(encoding="utf-8").splitlines()
\`\`\`

\`pathlib\` beats string paths every time — it handles separators, joins and suffixes for you.

### Writing your own context manager

\`\`\`python
from contextlib import contextmanager
import time

@contextmanager
def timer(label):
    start = time.perf_counter()
    yield
    print(f"{label}: {time.perf_counter() - start:.3f}s")
\`\`\`

You will use this pattern for timing training loops and managing database connections.`,
          },
        ],
      },
      {
        title: "Numerical Python",
        lessons: [
          {
            title: "NumPy arrays and broadcasting",
            type: "VIDEO",
            durationMinutes: 18,
            videoUrl: SAMPLE_VIDEO,
            content: `## NumPy arrays and broadcasting

A NumPy array is a block of numbers with a shape. Operations apply to whole arrays at once — no loops — and run in compiled code.

**Broadcasting** lets arrays of different shapes combine: a \`(1000, 3)\` matrix minus a \`(3,)\` vector subtracts the vector from every row. The rule: align shapes from the right; dimensions match if equal or one of them is 1.

In the lecture we vectorise the gradient-descent lab from *Foundations of Machine Learning* and watch it get 200× faster.`,
          },
          {
            title: "pandas for tabular data",
            type: "ARTICLE",
            durationMinutes: 16,
            content: `## pandas for tabular data

pandas gives you the DataFrame: labelled columns, aligned indices and a rich verb set. The verbs you will use daily:

\`\`\`python
df = pd.read_csv("admissions.csv", parse_dates=["applied_at"])
df = df.dropna(subset=["score"])
summary = (
    df.assign(month=df.applied_at.dt.to_period("M"))
      .groupby(["month", "program"])
      .agg(applications=("id", "count"), mean_score=("score", "mean"))
      .reset_index()
)
\`\`\`

### Habits

- Chain operations; avoid mutating in place across many cells.
- Set explicit dtypes when reading large files.
- Prefer \`.loc\` for label-based selection and never rely on chained assignment.
- Reach for \`polars\` when the data no longer fits comfortably in memory.`,
          },
          {
            title: "Lab · Vectorised z-scores",
            type: "LAB",
            durationMinutes: 25,
            content: `## Lab · Vectorised z-scores

Implement \`zscores(values)\` that returns a list of standardised values \`(x − mean) / std\` using population standard deviation. Do it with plain Python first; then, if you like, with NumPy (it is available in this lab environment as \`numpy\`).

Edge cases: a constant list (std = 0) should return all zeros rather than dividing by zero.`,
            lab: {
              language: "python",
              starterCode: `def zscores(values):
    """Standardise values to zero mean and unit variance."""
    raise NotImplementedError
`,
              hint: "Compute mean and std once, then transform. Guard std == 0.",
              tests: [
                { name: "standardises a simple list", code: "z = zscores([1, 2, 3, 4, 5])\nassert abs(z[0] + 1.41421356) < 1e-6 and abs(z[2]) < 1e-9" },
                { name: "constant input returns zeros", code: "assert zscores([7, 7, 7]) == [0, 0, 0]" },
                { name: "result has zero mean", code: "z = zscores([3, 9, 12, 15])\nassert abs(sum(z) / len(z)) < 1e-9" },
              ],
            },
          },
        ],
      },
      {
        title: "Engineering habits",
        lessons: [
          {
            title: "Testing and project structure",
            type: "ARTICLE",
            durationMinutes: 14,
            content: `## Testing and project structure

A model project is a software project. The minimum viable structure:

\`\`\`
project/
  pyproject.toml
  src/project/
    __init__.py
    data.py
    features.py
    model.py
  tests/
    test_features.py
  notebooks/
    01-explore.ipynb
\`\`\`

Notebooks import from \`src\`; nothing important lives only in a notebook.

### Tests that pay for themselves

- **Shape tests**: a transformation returns the expected number of rows and columns.
- **Invariant tests**: no NaNs after imputation; probabilities in [0, 1].
- **Golden tests**: a tiny fixed input produces a known output; catches silent regressions.

\`\`\`python
def test_zscores_have_zero_mean():
    z = zscores([3, 9, 12, 15])
    assert abs(sum(z) / len(z)) < 1e-9
\`\`\`

Run with \`pytest\`. Make the CI fail loudly.`,
          },
          {
            title: "Course check",
            type: "QUIZ",
            durationMinutes: 6,
            content: "A short check on the engineering habits from this course.",
            quiz: {
              questions: [
                { id: "p1", prompt: "Which selection is idiomatic in pandas?", options: ["df[df.col > 1]['other'] = 0", "df.loc[df.col > 1, 'other'] = 0", "df.other[df.col > 1] = 0", "for row in df: …"], answer: 1, explanation: ".loc with a boolean mask avoids chained assignment and is unambiguous." },
                { id: "p2", prompt: "Broadcasting a (3,) vector against a (1000, 3) matrix…", options: ["Fails with a shape error", "Applies the vector to every row", "Applies the vector to every column", "Requires a loop"], answer: 1, explanation: "Shapes align from the right: (3,) matches the last dimension, so it is applied across the 1000 rows." },
                { id: "p3", prompt: "Where should reusable model code live?", options: ["In the notebook that created it", "In src/ modules imported by notebooks and tests", "In a Slack message", "In the tests folder"], answer: 1, explanation: "Modules can be imported, versioned and tested; notebooks are for exploration." },
              ],
            },
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  {
    slug: "deep-learning-in-practice",
    title: "Deep Learning in Practice",
    subtitle: "Neural networks, trained with discipline",
    description: `Deep learning works when the practitioner respects the details: initialisation, normalisation, learning-rate schedules, data pipelines and the diagnostics that tell you which one is wrong. This course teaches those details through PyTorch, on datasets small enough to iterate on and large enough to matter.`,
    level: "INTERMEDIATE",
    category: "Deep Learning",
    durationHours: 28,
    accent: "violet",
    publishedDaysAgo: 100,
    tags: ["pytorch", "neural networks", "optimisation", "cnn"],
    learningOutcomes: [
      "Build and train feed-forward and convolutional networks in PyTorch.",
      "Diagnose training pathologies from loss curves and gradient statistics.",
      "Apply transfer learning and fine-tuning responsibly.",
    ],
    prerequisites: ["Foundations of Machine Learning", "Comfortable Python and NumPy"],
    instructorKey: "ayesha",
    programSlug: "professional-diploma-applied-ai",
    modules: [
      {
        title: "Networks from the ground up",
        lessons: [
          { title: "From logistic regression to a multilayer perceptron", type: "VIDEO", durationMinutes: 20, isPreview: true, videoUrl: SAMPLE_VIDEO, content: `## From logistic regression to a multilayer perceptron\n\nStack logistic regressions, insert a non-linearity between them, and you have a neural network. This lecture builds one in forty lines of NumPy, then shows the same network in PyTorch, so that the framework never feels like magic.\n\nWe cover why depth helps (composition of features), why non-linearities are mandatory (a stack of linear layers is still linear) and what the universal approximation theorem does and does not promise.` },
          { title: "Backpropagation, explained once properly", type: "ARTICLE", durationMinutes: 18, content: `## Backpropagation\n\nBackpropagation is the chain rule applied systematically. Each layer receives the gradient of the loss with respect to its output and passes back the gradient with respect to its input, multiplying by its local Jacobian along the way.\n\nThe practical consequences:\n\n- **Vanishing gradients** when many small factors multiply — why sigmoids fell out of favour and ReLU took over.\n- **Exploding gradients** when factors are large — why we clip.\n- **Dead units** when ReLUs receive only negative inputs — why initialisation matters.\n\nAutograd does the bookkeeping; understanding it tells you what to do when training stalls.` },
          { title: "Lab · Train an MLP on Fashion-MNIST", type: "LAB", durationMinutes: 40, content: `## Lab · A minimal training loop\n\nThis lab runs in your browser without PyTorch, so we simulate the essential structure: implement \`train_step(params, grads, lr)\` that applies a gradient-descent update to a dictionary of parameters, and \`accuracy(preds, labels)\`.\n\nThe real PyTorch notebook is linked in the project workspace for local execution.`, lab: { language: "python", starterCode: `def train_step(params, grads, lr):\n    """Return a new dict with each parameter updated by -lr * grad."""\n    raise NotImplementedError\n\n\ndef accuracy(preds, labels):\n    """Fraction of positions where preds[i] == labels[i]."""\n    raise NotImplementedError\n`, hint: "Dictionary comprehensions keep train_step to one line.", tests: [ { name: "train_step applies the update", code: "p = train_step({'w': 1.0, 'b': 0.5}, {'w': 0.5, 'b': -1.0}, 0.1)\nassert abs(p['w'] - 0.95) < 1e-9 and abs(p['b'] - 0.6) < 1e-9" }, { name: "train_step does not mutate the input", code: "src = {'w': 1.0}\ntrain_step(src, {'w': 1.0}, 0.1)\nassert src['w'] == 1.0" }, { name: "accuracy counts matches", code: "assert accuracy([1, 0, 1, 1], [1, 1, 1, 0]) == 0.5" } ] } },
        ],
      },
      {
        title: "Training discipline",
        lessons: [
          { title: "Initialisation, normalisation and schedules", type: "VIDEO", durationMinutes: 22, videoUrl: SAMPLE_VIDEO, content: `## Initialisation, normalisation and schedules\n\nThree decisions determine whether a network trains at all: how weights start (Kaiming/Xavier), how activations are kept in range (batch/layer norm) and how the learning rate evolves (warm-up, cosine decay, one-cycle). We show each in isolation on the same network and compare the loss curves.` },
          { title: "Reading loss curves", type: "ARTICLE", durationMinutes: 14, content: `## Reading loss curves\n\nA loss curve is a diagnostic instrument. Patterns and their usual causes:\n\n| Pattern | Likely cause |\n| --- | --- |\n| Flat from the start | Learning rate too low, dead units, or a bug in the data pipeline |\n| Immediate NaN | Learning rate too high, missing normalisation, log of zero |\n| Training falls, validation rises | Overfitting — add data, augmentation or regularisation |\n| Both plateau early | Model too small or features uninformative |\n| Periodic spikes | Learning-rate schedule or a bad batch (check for outliers) |\n\nAlways plot **both** curves on the same axes, and log gradient norms per layer for anything larger than a toy.` },
          { title: "Module quiz · Training", type: "QUIZ", durationMinutes: 8, content: "Check your diagnostic instincts.", quiz: { questions: [ { id: "d1", prompt: "Training loss drops steadily while validation loss starts rising after epoch 5. What is happening?", options: ["Learning rate too low", "Overfitting", "Vanishing gradients", "Data leakage"], answer: 1, explanation: "The model is fitting training noise; regularise, augment or stop early." }, { id: "d2", prompt: "Why must a non-linearity sit between linear layers?", options: ["For speed", "Because stacked linear maps are still linear", "To reduce parameters", "To normalise activations"], answer: 1, explanation: "Without non-linearities the network can only represent a single linear transformation." }, { id: "d3", prompt: "Loss becomes NaN in the first few steps. First thing to try?", options: ["Add more layers", "Lower the learning rate and check for log(0)", "Increase batch size", "Change the optimiser to SGD"], answer: 1, explanation: "Exploding updates or numerical issues in the loss are the usual culprits." } ] } },
        ],
      },
      {
        title: "Convolutions and transfer",
        lessons: [
          { title: "Convolutional networks", type: "VIDEO", durationMinutes: 21, videoUrl: SAMPLE_VIDEO, content: `## Convolutional networks\n\nConvolutions encode a prior: nearby pixels are related and the same feature can appear anywhere. We build a small CNN, visualise its filters, and see why pooling and stride trade resolution for invariance.` },
          { title: "Transfer learning and fine-tuning", type: "ARTICLE", durationMinutes: 16, content: `## Transfer learning\n\nFor most applied vision problems you will not train from scratch. Start from a network pre-trained on a large dataset, replace the head, and fine-tune with a small learning rate. Freeze early layers when data is scarce; unfreeze progressively as it grows.\n\nWatch for **distribution shift**: a model pre-trained on photographs may need many more examples to adapt to satellite or medical imagery than the tutorials suggest.` },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  {
    slug: "natural-language-processing-with-transformers",
    title: "NLP with Transformers",
    subtitle: "How language models actually work",
    description: `Tokenisation, attention, positional encodings, pre-training objectives and fine-tuning — taught so that when you read a model card you understand every line. Includes a focus on Urdu and other low-resource languages, where the tricks that work for English often fail.`,
    level: "INTERMEDIATE",
    category: "Language",
    durationHours: 24,
    accent: "coral",
    publishedDaysAgo: 90,
    tags: ["transformers", "attention", "tokenisation", "urdu"],
    learningOutcomes: [
      "Explain self-attention and the transformer block from memory.",
      "Choose and adapt tokenisers for multilingual text.",
      "Fine-tune encoder and decoder models for classification and generation.",
    ],
    prerequisites: ["Deep Learning in Practice or equivalent"],
    instructorKey: "bilal",
    programSlug: "professional-diploma-applied-ai",
    modules: [
      {
        title: "Representing text",
        lessons: [
          { title: "Tokenisation is a modelling decision", type: "ARTICLE", durationMinutes: 16, isPreview: true, content: `## Tokenisation is a modelling decision\n\nBefore a model sees text it sees integers, and the mapping from text to integers shapes everything downstream. Byte-pair encoding, WordPiece and SentencePiece each make trade-offs between vocabulary size, sequence length and robustness to unseen words.\n\nFor Urdu, Sindhi and Pashto, vocabularies trained on English-heavy corpora fragment words into many tokens: a 20-word Urdu sentence can cost three times the tokens of its English translation. This inflates cost, shortens effective context and hurts quality. We measure it on real text and explore fixes: vocabulary extension, custom tokenisers and byte-level fallbacks.` },
          { title: "Embeddings and similarity", type: "VIDEO", durationMinutes: 18, videoUrl: SAMPLE_VIDEO, content: `## Embeddings\n\nAn embedding is a learned vector in which geometry means something: nearby vectors are similar in whatever sense the training objective rewarded. We train word2vec on a small corpus live, then contrast static embeddings with the contextual embeddings transformers produce.` },
        ],
      },
      {
        title: "Attention and the transformer",
        lessons: [
          { title: "Self-attention from scratch", type: "VIDEO", durationMinutes: 24, videoUrl: SAMPLE_VIDEO, content: `## Self-attention\n\nEach token asks a question (query), every token offers an answer (key) and content (value); attention weights are the softmax of query–key similarity. That is the whole mechanism. We implement it in twenty lines, add multiple heads, then positional information, then the residual and normalisation structure that lets us stack dozens of blocks.` },
          { title: "Lab · Attention weights", type: "LAB", durationMinutes: 35, content: `## Lab · Scaled dot-product attention\n\nImplement \`attention(q, k, v)\` for small lists of vectors using only Python: compute scores \`q·k / sqrt(d)\`, apply softmax across keys, and return the weighted sum of values for each query.`, lab: { language: "python", starterCode: `import math\n\n\ndef softmax(xs):\n    m = max(xs)\n    exps = [math.exp(x - m) for x in xs]\n    s = sum(exps)\n    return [e / s for e in exps]\n\n\ndef attention(q, k, v):\n    """q, k, v: lists of equal-length vectors. Return list of output vectors (one per query)."""\n    raise NotImplementedError\n`, hint: "For each query, compute one score per key, softmax them, then weight the value vectors.", tests: [ { name: "identical keys give uniform weights", code: "out = attention([[1, 0]], [[1, 0], [1, 0]], [[1, 1], [3, 3]])\nassert all(abs(a - 2) < 1e-9 for a in out[0])" }, { name: "sharp match attends to the right value", code: "out = attention([[10, 0]], [[10, 0], [0, 10]], [[1, 0], [0, 1]])\nassert out[0][0] > 0.99 and out[0][1] < 0.01" }, { name: "one output per query", code: "out = attention([[1, 0], [0, 1]], [[1, 0], [0, 1]], [[1, 2], [3, 4]])\nassert len(out) == 2" } ] } },
          { title: "Module quiz · Transformers", type: "QUIZ", durationMinutes: 8, content: "Attention, positions and blocks.", quiz: { questions: [ { id: "t1", prompt: "Why divide attention scores by √d?", options: ["To normalise the vocabulary", "To keep softmax from saturating as dimension grows", "To speed up matrix multiplication", "To add positional information"], answer: 1, explanation: "Dot products grow with dimension; scaling keeps gradients healthy." }, { id: "t2", prompt: "Without positional encodings, a transformer treats its input as…", options: ["A sequence", "A set", "A tree", "An image"], answer: 1, explanation: "Attention is permutation-invariant; positions must be injected explicitly." }, { id: "t3", prompt: "An Urdu sentence costing three times the tokens of its English translation mainly affects…", options: ["Nothing", "Cost, effective context and quality", "Only speed", "Only the vocabulary size"], answer: 1, explanation: "Fragmentation inflates cost, shortens usable context and degrades representations." } ] } },
        ],
      },
      {
        title: "Fine-tuning",
        lessons: [
          { title: "Encoders for classification", type: "ARTICLE", durationMinutes: 15, content: `## Encoders for classification\n\nFine-tuning a pre-trained encoder for sentiment, intent or topic is a few hundred lines and a few minutes on a modest GPU. What separates good from mediocre results is the data: label quality, class balance and an evaluation set that reflects deployment text (with its typos, code-switching and slang).` },
          { title: "Decoders and generation", type: "VIDEO", durationMinutes: 19, videoUrl: SAMPLE_VIDEO, content: `## Decoders and generation\n\nSampling strategy is a product decision: greedy decoding is deterministic and dull, temperature and nucleus sampling trade coherence for variety, and beam search suits translation more than conversation. We compare outputs from the same model under each setting.` },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  {
    slug: "llm-engineering-and-evaluation",
    title: "LLM Engineering & Evaluation",
    subtitle: "Build language systems you can measure",
    description: `The course for engineers who have shipped a prototype on a language model and discovered that the hard part had not started. We cover context engineering, retrieval, structured outputs, tool use and agents — and, running through all of it, evaluation: how to know whether a change made things better.

You will build one assistant three ways and measure each on an evaluation set you construct. Every lab runs in the browser; the Claude-powered tutor can see your code and the brief.`,
    level: "ADVANCED",
    category: "Language",
    durationHours: 30,
    accent: "ink",
    featured: true,
    publishedDaysAgo: 45,
    tags: ["llm", "rag", "evaluation", "agents", "claude"],
    learningOutcomes: [
      "Design prompts, context windows and caching strategies with measured cost and quality.",
      "Build retrieval-augmented generation with hybrid search and defensible chunking.",
      "Construct evaluation sets and judge pipelines; detect regressions before users do.",
      "Implement tool-using agents with permission boundaries, observability and budgets.",
    ],
    prerequisites: ["Professional Python and HTTP APIs", "NLP with Transformers (recommended)"],
    instructorKey: "bilal",
    programSlug: "advanced-certificate-llm-engineering",
    modules: [
      {
        title: "Language models as components",
        summary: "Treat the model as an unreliable but powerful function, and engineer around it.",
        lessons: [
          {
            title: "The model is a function with a distribution over outputs",
            type: "VIDEO",
            durationMinutes: 16,
            isPreview: true,
            videoUrl: SAMPLE_VIDEO,
            content: `## The model is a function with a distribution over outputs

Engineers are used to functions that return the same thing twice. Language models do not, and pretending otherwise is the root of most production incidents.

The mental model that works: the model maps *(system prompt, conversation, tools)* to a **distribution** over completions. Your job is to shape the distribution (prompting, examples, constraints), sample from it wisely (temperature, structured outputs) and **measure** it (evals).

We also cover the anatomy of a request — system, messages, tools, output constraints — using the Anthropic Messages API as the reference implementation, and the cost model that follows from it: input tokens, output tokens, cache reads.`,
          },
          {
            title: "Context engineering",
            type: "ARTICLE",
            durationMinutes: 18,
            content: `## Context engineering

“Prompt engineering” undersells the job. You are designing the entire context the model sees, and every decision has a cost and a quality consequence.

### Order matters twice

1. **For the model.** Instructions first, then reference material, then the task, then the output format. Put the most important constraints near the end, where recency helps.
2. **For the cache.** Prompt caching is a prefix match. Stable content (system prompt, tool definitions, reference documents) goes first; volatile content (timestamps, user data) goes last. A single changed byte early in the prompt invalidates everything after it.

### System prompts that age well

- State the role, the audience and the boundaries in plain sentences.
- Prefer describing the *situation* over listing rules; models generalise from situations.
- Give two or three examples of the hardest cases, not ten of the easy ones.
- Version the prompt in source control and evaluate every change.

### Structured outputs

When downstream code parses the response, do not parse prose. Ask for JSON that matches a schema and validate it. Modern APIs support constrained outputs directly; use them, and keep a fallback for the rare malformed response.

### Budgets

Decide the maximum context you will send *before* you build the feature. Retrieval, summarisation and truncation strategies follow from that number.`,
          },
          {
            title: "Lab · Token budget planner",
            type: "LAB",
            durationMinutes: 30,
            content: `## Lab · Token budget planner

Write \`plan_context(sections, budget)\` in JavaScript. \`sections\` is an array of \`{ name, tokens, priority }\` (priority 1 is highest). Return the names to include so that the total tokens never exceed \`budget\`, choosing by priority first and then by original order among equal priorities. Always include priority-1 sections if they fit; never exceed the budget.`,
            lab: {
              language: "javascript",
              starterCode: `function planContext(sections, budget) {
  // Return an array of section names to include.
  return [];
}
`,
              hint: "Sort a copy by priority (stable sort keeps original order within a priority), then greedily add while the running total fits.",
              tests: [
                { name: "includes everything when it fits", code: "const r = planContext([{name:'sys',tokens:100,priority:1},{name:'doc',tokens:200,priority:2}], 500);\nif (JSON.stringify(r) !== JSON.stringify(['sys','doc'])) throw new Error(JSON.stringify(r));" },
                { name: "drops low-priority sections first", code: "const r = planContext([{name:'sys',tokens:100,priority:1},{name:'doc',tokens:400,priority:2},{name:'chat',tokens:150,priority:1}], 300);\nif (JSON.stringify(r) !== JSON.stringify(['sys','chat'])) throw new Error(JSON.stringify(r));" },
                { name: "never exceeds the budget", code: "const s=[{name:'a',tokens:90,priority:1},{name:'b',tokens:90,priority:1},{name:'c',tokens:90,priority:1}];\nconst r = planContext(s, 200);\nconst total = r.reduce((n,name)=>n+s.find(x=>x.name===name).tokens,0);\nif (total > 200) throw new Error('over budget: '+total);" },
              ],
            },
          },
        ],
      },
      {
        title: "Retrieval-augmented generation",
        summary: "Give the model the right facts at the right time, and prove that it helped.",
        lessons: [
          {
            title: "Chunking, embeddings and hybrid search",
            type: "VIDEO",
            durationMinutes: 22,
            videoUrl: SAMPLE_VIDEO,
            content: `## Chunking, embeddings and hybrid search

Retrieval fails quietly. The answer looks plausible, the citation looks real, and nobody notices the passage was the wrong one.

We cover:

- **Chunking** by structure (headings, paragraphs) rather than fixed windows; overlap; keeping metadata.
- **Embeddings** and their failure modes: negation, numbers, domain vocabulary.
- **Hybrid search** — dense embeddings plus BM25 keyword matching — which wins on most enterprise corpora.
- **Re-ranking** the top-k with a cross-encoder or the model itself.

Then we measure: recall@k on a set of questions with known source passages. Without this number you are guessing.`,
          },
          {
            title: "Constructing an evaluation set",
            type: "ARTICLE",
            durationMinutes: 20,
            content: `## Constructing an evaluation set

An evaluation set is the most valuable artefact in an LLM project. It converts opinions into measurements and lets you change anything with confidence.

### Where questions come from

1. **Real usage.** Logged queries (with consent), clustered and sampled across the distribution.
2. **Domain experts.** Ask them for the twenty questions they would use to test a new hire.
3. **Synthesis.** Generate questions from documents with a model, then have humans discard the bad ones. Synthesis inflates easy cases; sample deliberately for hard ones.

### What to record

| Field | Why |
| --- | --- |
| question | the input |
| reference answer or rubric | what “correct” means |
| source passages | for retrieval recall |
| tags (topic, difficulty, language) | to slice results |

### Grading

- **Exact / contains** for factual short answers.
- **Rubric with an LLM judge** for open answers — and validate the judge against human labels on a sample before trusting it.
- **Pairwise preference** when you compare two systems.

Start with fifty questions. A hundred well-chosen questions beat a thousand synthetic ones. Freeze a test split and never tune on it.`,
          },
          {
            title: "Module quiz · RAG and evaluation",
            type: "QUIZ",
            durationMinutes: 8,
            content: "Retrieval quality and measurement.",
            quiz: {
              questions: [
                { id: "r1", prompt: "Which metric directly measures whether retrieval found the right passage?", options: ["BLEU", "Recall@k over known source passages", "Perplexity", "Output token count"], answer: 1, explanation: "If the correct passage is not in the top-k, generation cannot be grounded on it." },
                { id: "r2", prompt: "Hybrid search combines…", options: ["Two embedding models", "Dense embeddings and keyword matching", "Two language models", "Retrieval and fine-tuning"], answer: 1, explanation: "Dense retrieval captures meaning; BM25 captures exact terms, identifiers and rare words." },
                { id: "r3", prompt: "Before trusting an LLM judge you should…", options: ["Use a bigger model", "Validate it against human labels on a sample", "Lower the temperature", "Remove the rubric"], answer: 1, explanation: "Judges have biases (length, position, style). Measure agreement with humans first." },
                { id: "r4", prompt: "Tuning prompts on the frozen test split leads to…", options: ["Better generalisation", "Over-optimistic scores that will not hold in production", "Faster inference", "Lower cost"], answer: 1, explanation: "The test set stops being a fair test the moment you optimise against it." },
              ],
            },
          },
        ],
      },
      {
        title: "Tools, agents and safety",
        summary: "Let the model act — inside boundaries you can defend.",
        lessons: [
          {
            title: "Tool use and the agent loop",
            type: "VIDEO",
            durationMinutes: 21,
            videoUrl: SAMPLE_VIDEO,
            content: `## Tool use and the agent loop

A tool is a function the model can ask you to call. The loop is simple: send the conversation with tool definitions; if the model returns a tool call, execute it, append the result, repeat until it stops. Everything difficult lives in the details:

- **Descriptions** are prompts. Write them for the model, with examples of when *not* to use the tool.
- **Parallel calls** — execute concurrently, return all results in one message.
- **Errors** are results too; return them so the model can recover.
- **Budgets** — cap iterations and tokens; agents without limits will find them for you.

We build a small research agent with three tools and watch it plan, fail, retry and finish.`,
          },
          {
            title: "Guardrails, permissions and red-teaming",
            type: "ARTICLE",
            durationMinutes: 17,
            content: `## Guardrails, permissions and red-teaming

An agent that can act can be manipulated into acting. Treat every piece of retrieved or user-supplied text as untrusted input — the same discipline as SQL injection, now applied to natural language.

### Layers

1. **Capability limits.** The agent can only call tools you give it; scope credentials per tool; prefer read-only.
2. **Permission gates.** Irreversible actions (payments, deletions, sending messages) require confirmation from a human or a policy check.
3. **Input handling.** Label retrieved content as data in the prompt; never let it override instructions.
4. **Output checks.** Validate structured outputs; scan for secrets and PII before they leave the system.
5. **Observability.** Log every tool call with inputs and outputs; you will need the trail.

### Red-team before launch

Write twenty adversarial prompts — injection in documents, role-play jailbreaks, requests to exfiltrate data — and add them to the evaluation set. Re-run them on every change. Security that is not measured regresses.`,
          },
          {
            title: "Lab · Safe tool dispatcher",
            type: "LAB",
            durationMinutes: 35,
            content: `## Lab · Safe tool dispatcher

Implement \`dispatch(call, registry, policy)\` in JavaScript.

- \`call\` is \`{ name, input }\`.
- \`registry\` maps tool names to \`{ run(input), sideEffects: boolean }\`.
- \`policy\` is \`{ allow: string[], requireConfirmation: string[] }\`.

Rules: unknown or disallowed tools return \`{ ok: false, error: 'not_allowed' }\`; tools in \`requireConfirmation\` return \`{ ok: false, error: 'confirmation_required' }\` unless \`call.confirmed === true\`; otherwise call \`run\` and return \`{ ok: true, result }\`. If \`run\` throws, return \`{ ok: false, error: 'tool_error', message }\`.`,
            lab: {
              language: "javascript",
              starterCode: `function dispatch(call, registry, policy) {
  // TODO
}
`,
              hint: "Check allow-list first, then confirmation, then execute inside try/catch.",
              tests: [
                { name: "blocks tools not in the allow list", code: "const r = dispatch({name:'rm',input:{}}, {rm:{run:()=>1,sideEffects:true}}, {allow:['ls'],requireConfirmation:[]});\nif (r.ok !== false || r.error !== 'not_allowed') throw new Error(JSON.stringify(r));" },
                { name: "requires confirmation for gated tools", code: "const r = dispatch({name:'pay',input:{}}, {pay:{run:()=>'paid',sideEffects:true}}, {allow:['pay'],requireConfirmation:['pay']});\nif (r.error !== 'confirmation_required') throw new Error(JSON.stringify(r));" },
                { name: "runs confirmed and allowed tools", code: "const r = dispatch({name:'pay',input:{amt:5},confirmed:true}, {pay:{run:(i)=>'paid '+i.amt,sideEffects:true}}, {allow:['pay'],requireConfirmation:['pay']});\nif (!r.ok || r.result !== 'paid 5') throw new Error(JSON.stringify(r));" },
                { name: "captures tool errors", code: "const r = dispatch({name:'ls',input:{}}, {ls:{run:()=>{throw new Error('boom')},sideEffects:false}}, {allow:['ls'],requireConfirmation:[]});\nif (r.ok || r.error !== 'tool_error' || r.message !== 'boom') throw new Error(JSON.stringify(r));" },
              ],
            },
          },
        ],
      },
      {
        title: "Operating LLM features",
        lessons: [
          {
            title: "Cost, latency and caching",
            type: "ARTICLE",
            durationMinutes: 16,
            content: `## Cost, latency and caching

The bill and the p95 latency are both functions of tokens. Levers, in the order to pull them:

1. **Prompt caching.** Stable prefix first; verify with cache-read token counts. Typical savings: 60–90% on input.
2. **Input hygiene.** Trim retrieved passages to what is needed; deduplicate; drop stale turns.
3. **Output discipline.** Ask for the shortest useful answer; structured outputs are shorter than prose.
4. **Effort and model choice.** Lower reasoning effort on routine routes; measure before assuming a smaller model is cheaper *per completed task*.
5. **Batching** for anything not latency-sensitive.

Instrument every request with tokens, cache reads, latency and the route name. A dashboard of cost per completed task is the one that matters.`,
          },
          {
            title: "Final assessment",
            type: "QUIZ",
            durationMinutes: 12,
            content: "Nine questions across the course. 70% completes the course.",
            quiz: {
              questions: [
                { id: "l1", prompt: "Prompt caching is invalidated by…", options: ["Any change in the cached prefix", "Only changes to the system prompt", "Longer outputs", "Using tools"], answer: 0, explanation: "Caching is a prefix match; one changed byte early invalidates everything after it." },
                { id: "l2", prompt: "Returning parallel tool results across several messages…", options: ["Improves accuracy", "Silently teaches the model to stop calling tools in parallel", "Is required by the API", "Reduces cost"], answer: 1, explanation: "Return all results in a single message so the model keeps parallelising." },
                { id: "l3", prompt: "Retrieved document text should be treated as…", options: ["Trusted instructions", "Untrusted data", "System prompt", "Output"], answer: 1, explanation: "Prompt injection arrives through retrieved and user-supplied content." },
                { id: "l4", prompt: "The most valuable artefact in an LLM project is…", options: ["The system prompt", "The evaluation set", "The vector database", "The model choice"], answer: 1, explanation: "It converts opinion into measurement and makes every other change safe." },
                { id: "l5", prompt: "A tool error should be…", options: ["Dropped", "Returned to the model as a result marked as an error", "Retried forever", "Logged only"], answer: 1, explanation: "The model can recover if it knows what failed." },
                { id: "l6", prompt: "Which metric should a cost dashboard centre on?", options: ["Tokens per request", "Cost per completed task", "Requests per minute", "Cache hit rate"], answer: 1, explanation: "A cheaper request that needs retries is not cheaper." },
                { id: "l7", prompt: "Hybrid search is preferred on enterprise corpora because…", options: ["It is cheaper", "Exact identifiers and rare terms are captured by keyword matching", "Embeddings are unnecessary", "It removes the need for chunking"], answer: 1, explanation: "Dense retrieval alone misses part numbers, names and codes." },
                { id: "l8", prompt: "Irreversible agent actions should…", options: ["Run automatically for speed", "Require a confirmation gate", "Be logged only", "Be disabled always"], answer: 1, explanation: "Permission gates for side effects are the core safety boundary." },
                { id: "l9", prompt: "Synthetic evaluation questions tend to…", options: ["Be harder than real ones", "Over-represent easy cases", "Match production perfectly", "Need no human review"], answer: 1, explanation: "Generated questions skew easy; sample deliberately for hard cases and review them." },
              ],
            },
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  {
    slug: "computer-vision-systems",
    title: "Computer Vision Systems",
    subtitle: "From pixels to decisions in the field",
    description: `Vision that works in a lab and vision that works on a dusty road at 4pm are different disciplines. This course covers detection, segmentation and tracking, then the systems work: data collection, labelling, edge deployment and monitoring, with case studies from agriculture and infrastructure inspection in Pakistan.`,
    level: "INTERMEDIATE",
    category: "Vision",
    durationHours: 26,
    accent: "sky",
    publishedDaysAgo: 75,
    tags: ["detection", "segmentation", "edge", "labelling"],
    learningOutcomes: ["Train and evaluate detection and segmentation models.", "Design labelling workflows with quality control.", "Deploy models on edge devices with latency budgets."],
    prerequisites: ["Deep Learning in Practice"],
    instructorKey: "zara",
    programSlug: "professional-diploma-applied-ai",
    modules: [
      { title: "Seeing", lessons: [
        { title: "Detection and segmentation", type: "VIDEO", durationMinutes: 22, isPreview: true, videoUrl: SAMPLE_VIDEO, content: `## Detection and segmentation\n\nClassification says *what*; detection adds *where*; segmentation adds *which pixels*. We survey the modern architectures, then focus on the two decisions that matter most in practice: the input resolution you can afford and the labelling budget you actually have.` },
        { title: "Labelling as an engineering problem", type: "ARTICLE", durationMinutes: 15, content: `## Labelling as an engineering problem\n\nLabels are data, and data has bugs. Build labelling like software: written guidelines with examples of edge cases, double labelling on a sample to measure agreement, a review queue for disagreements, and versioned label sets. A 5% improvement in label consistency routinely beats a new architecture.` },
      ] },
      { title: "Deploying", lessons: [
        { title: "Edge deployment and latency budgets", type: "VIDEO", durationMinutes: 20, videoUrl: SAMPLE_VIDEO, content: `## Edge deployment\n\nQuantisation, pruning and distillation trade accuracy for speed. We profile a detector on a Jetson-class device and on a phone, set a latency budget, and choose the model that meets it — then measure accuracy on the *deployed* model, not the trained one.` },
        { title: "Monitoring vision in production", type: "ARTICLE", durationMinutes: 14, content: `## Monitoring vision in production\n\nCameras drift: lenses dirty, seasons change, new objects appear. Monitor input statistics (brightness, blur, distribution of predicted classes), sample predictions for human review weekly, and keep a retraining loop that ingests reviewed samples. A model without a feedback loop is a model that is quietly failing.` },
        { title: "Module quiz · Vision systems", type: "QUIZ", durationMinutes: 6, content: "Deployment and data.", quiz: { questions: [ { id: "c1", prompt: "The accuracy you should report for a deployed model is measured on…", options: ["The training checkpoint", "The quantised model actually deployed", "The validation set at full precision", "The paper's benchmark"], answer: 1, explanation: "Quantisation and export change behaviour; measure what ships." }, { id: "c2", prompt: "Double-labelling a sample is used to…", options: ["Double the dataset", "Measure annotator agreement", "Speed up labelling", "Replace guidelines"], answer: 1, explanation: "Agreement reveals ambiguous guidelines and unreliable labels." } ] } },
      ] },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  {
    slug: "ai-safety-alignment-and-governance",
    title: "AI Safety, Alignment & Governance",
    subtitle: "What could go wrong, and what to do about it",
    description: `A course for anyone who will deploy, regulate, procure or lead AI systems. It is technical enough to be honest and accessible enough to be useful: how models fail, how they are evaluated, what alignment research actually does, and how institutions in Pakistan and abroad are governing deployment.

Required for every diploma and executive cohort at the institute.`,
    level: "BEGINNER",
    category: "Safety & Policy",
    durationHours: 12,
    accent: "gold",
    featured: true,
    publishedDaysAgo: 60,
    tags: ["safety", "alignment", "governance", "evaluation", "policy"],
    learningOutcomes: [
      "Describe the main failure modes of deployed AI systems with real examples.",
      "Read an evaluation or model card critically.",
      "Design a governance process for an AI deployment in your organisation.",
    ],
    prerequisites: ["None"],
    instructorKey: "fatima",
    programSlug: "executive-ai-strategy",
    modules: [
      {
        title: "How systems fail",
        lessons: [
          {
            title: "A taxonomy of failure",
            type: "VIDEO",
            durationMinutes: 18,
            isPreview: true,
            videoUrl: SAMPLE_VIDEO,
            content: `## A taxonomy of failure

We organise failures by *where* they enter:

- **Specification** — the objective was wrong (optimising engagement, not wellbeing).
- **Data** — the training data encoded a bias or a shortcut (historical hiring decisions).
- **Robustness** — the world shifted (a fraud model after a new payment method).
- **Misuse** — the system was used for something it was not built for.
- **Interaction** — humans over- or under-trusted the system (automation bias in radiology).

For each we walk through a documented case, what the post-mortem found, and what would have caught it earlier.`,
          },
          {
            title: "Reading a model card",
            type: "ARTICLE",
            durationMinutes: 14,
            content: `## Reading a model card

A model card is the manufacturer’s label for a model. Learn to read it the way a clinician reads a drug label.

### Questions to ask

1. **Intended use.** Does my use case appear? Does the out-of-scope section mention it?
2. **Evaluation.** Which benchmarks, and do they resemble my data? Are results broken down by language, region, demographic?
3. **Training data.** Is its provenance described? Are there known gaps (Urdu? medical text? low-light images)?
4. **Known limitations.** Every honest card has them. A card without limitations is a red flag.
5. **Safety evaluations.** What was tested — bias, toxicity, jailbreaks, dangerous capabilities — and by whom?

### Exercise

Read the card for a widely used model and write one paragraph on whether you would deploy it for automated customer support at a Pakistani bank. Bring it to the live session.`,
          },
          {
            title: "Module quiz · Failure modes",
            type: "QUIZ",
            durationMinutes: 6,
            content: "Classify the cases.",
            quiz: {
              questions: [
                { id: "s1", prompt: "A recruitment model trained on ten years of hiring decisions downgrades CVs from women’s colleges. This is primarily a…", options: ["Robustness failure", "Data failure", "Misuse failure", "Interaction failure"], answer: 1, explanation: "The training data encoded historical bias which the model reproduced." },
                { id: "s2", prompt: "Radiologists accept an AI’s wrong reading because it is usually right. This is…", options: ["Specification failure", "Interaction failure (automation bias)", "Data failure", "Robustness failure"], answer: 1, explanation: "Over-trust in an automated system is a well-documented human-factors failure." },
                { id: "s3", prompt: "A model card without a limitations section is…", options: ["A sign of a perfect model", "A red flag", "Standard practice", "Irrelevant"], answer: 1, explanation: "Every model has limitations; omitting them signals an incomplete evaluation." },
              ],
            },
          },
        ],
      },
      {
        title: "Alignment and evaluation",
        lessons: [
          { title: "What alignment research does", type: "VIDEO", durationMinutes: 20, videoUrl: SAMPLE_VIDEO, content: `## What alignment research does\n\nAlignment is the study of making systems do what we intend, including when we cannot specify it precisely. We cover learning from human feedback and its pitfalls, constitutional approaches, interpretability as an audit tool, and evaluations for dangerous capabilities — with an honest account of what remains unsolved.` },
          { title: "Evaluation and red-teaming in practice", type: "ARTICLE", durationMinutes: 16, content: `## Evaluation and red-teaming\n\nBefore deployment, and on every significant change, run three kinds of evaluation:\n\n1. **Capability** — does it do the job? Measured on your data.\n2. **Safety** — bias across groups, harmful content, privacy leakage, prompt injection.\n3. **Human factors** — do the people using it understand what it can and cannot do?\n\nRed-teaming is structured adversarial testing. Give a small team a week, a scope and a scoring sheet. Publish the findings internally and track fixes like security vulnerabilities.` },
        ],
      },
      {
        title: "Governance",
        lessons: [
          { title: "Governance that works in institutions", type: "ARTICLE", durationMinutes: 18, content: `## Governance that works\n\nGovernance is not a document; it is a set of decisions with owners.\n\n| Decision | Owner | Artefact |\n| --- | --- | --- |\n| Is this use case acceptable? | Ethics committee or accountable executive | Use-case register |\n| Is the model good enough? | Technical lead | Evaluation report |\n| Who is accountable when it fails? | Named executive | Incident playbook |\n| How do affected people appeal? | Operations | Appeals process |\n| When do we re-evaluate? | Model owner | Review calendar |\n\nWe look at how the EU AI Act, NIST’s risk framework and emerging guidance in Pakistan map onto this table, and what a proportionate process looks like for a small organisation.` },
          { title: "Course assessment", type: "QUIZ", durationMinutes: 10, content: "Six questions. 70% completes the course.", quiz: { questions: [
            { id: "g1", prompt: "Which artefact records whether a use case is acceptable at all?", options: ["Evaluation report", "Use-case register", "Incident playbook", "Model card"], answer: 1, explanation: "The register documents the decision and its owner before anything is built." },
            { id: "g2", prompt: "Prompt injection is best classified as a…", options: ["Capability issue", "Safety issue requiring evaluation on every change", "Human-factors issue", "Data-quality issue"], answer: 1, explanation: "It is an adversarial input attack; test for it continuously." },
            { id: "g3", prompt: "A proportionate governance process for a small organisation should…", options: ["Copy a large regulator’s framework verbatim", "Name owners for each key decision", "Avoid documentation", "Delegate everything to the vendor"], answer: 1, explanation: "Ownership is what makes governance real at any scale." },
            { id: "g4", prompt: "Learning from human feedback can go wrong when…", options: ["Feedback is too consistent", "The model learns to please raters rather than be correct", "It is used on small models", "It is combined with evaluation"], answer: 1, explanation: "Sycophancy is a documented failure mode of preference-based training." },
            { id: "g5", prompt: "An appeals process exists so that…", options: ["Engineers can retrain faster", "Affected people can contest automated decisions", "Regulators are satisfied", "Vendors are accountable"], answer: 1, explanation: "Automated decisions need a human path to review and reversal." },
            { id: "g6", prompt: "Model evaluations should be repeated…", options: ["Only before launch", "On every significant change", "Annually", "Never after deployment"], answer: 1, explanation: "Models, data and the world all change; evaluation is continuous." },
          ] } },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  {
    slug: "mlops-and-production-systems",
    title: "MLOps & Production Systems",
    subtitle: "Ship models that keep working",
    description: `Reproducible training, feature pipelines, model registries, serving under latency budgets, monitoring, drift detection and incident response. Taught with the tools teams actually use and the war stories that explain why they use them.`,
    level: "ADVANCED",
    category: "Engineering",
    durationHours: 24,
    accent: "slate",
    publishedDaysAgo: 50,
    tags: ["mlops", "serving", "monitoring", "pipelines"],
    learningOutcomes: ["Design reproducible training pipelines with lineage.", "Serve models with SLOs, canaries and rollbacks.", "Monitor drift and run incident response for ML."],
    prerequisites: ["Professional software engineering experience", "Foundations of Machine Learning"],
    instructorKey: "omar",
    programSlug: "professional-diploma-applied-ai",
    modules: [
      { title: "Reproducibility", lessons: [
        { title: "Pipelines, lineage and registries", type: "VIDEO", durationMinutes: 22, isPreview: true, videoUrl: SAMPLE_VIDEO, content: `## Pipelines, lineage and registries\n\nIf you cannot rebuild a model from its inputs, you do not own it. We wire a training pipeline with versioned data, tracked parameters and artefacts in a registry, then prove reproducibility by rebuilding a six-month-old model bit for bit.` },
        { title: "Feature stores, honestly", type: "ARTICLE", durationMinutes: 14, content: `## Feature stores, honestly\n\nA feature store solves one real problem — training/serving skew — and creates several. Adopt one when multiple models share features across teams; otherwise a well-tested transformation library and a schema registry cover most needs. We compare both with a worked example.` },
      ] },
      { title: "Serving and monitoring", lessons: [
        { title: "Serving under a latency budget", type: "VIDEO", durationMinutes: 20, videoUrl: SAMPLE_VIDEO, content: `## Serving\n\nBatch, online and streaming inference each fit different products. We set an SLO, profile a model, and walk through the levers: batching, caching, quantisation, hardware choice, and the canary-then-rollback deployment that makes changes safe.` },
        { title: "Drift, monitoring and incidents", type: "ARTICLE", durationMinutes: 16, content: `## Drift, monitoring and incidents\n\nMonitor inputs (schema, distributions), outputs (prediction distribution, confidence) and outcomes (when labels arrive). Alert on change relative to a reference window, not on absolute thresholds. Write the incident playbook before the first incident: who is paged, how to roll back, how to communicate to users.` },
        { title: "Module quiz · Operations", type: "QUIZ", durationMinutes: 6, content: "Operational judgement.", quiz: { questions: [ { id: "m1", prompt: "Training/serving skew is…", options: ["A hardware mismatch", "Features computed differently at training and prediction time", "A latency problem", "A labelling issue"], answer: 1, explanation: "Different code paths produce different feature values; the model sees data it was not trained on." }, { id: "m2", prompt: "The safest way to release a new model version is…", options: ["Replace the old one at midnight", "Canary to a small share of traffic with automatic rollback", "Ask users to opt in", "Retrain in production"], answer: 1, explanation: "Canaries limit blast radius and rollbacks make mistakes cheap." } ] } },
      ] },
    ],
  },

  // A draft course to exercise the studio and course builder.
  {
    slug: "reinforcement-learning-foundations",
    title: "Reinforcement Learning Foundations",
    subtitle: "Learning from consequences",
    description: `Markov decision processes, value functions, policy gradients and the practical realities of reward design. In development for the next diploma cohort.`,
    level: "ADVANCED",
    category: "Machine Learning",
    durationHours: 18,
    accent: "violet",
    status: "DRAFT",
    tags: ["reinforcement learning", "mdp", "policy gradient"],
    learningOutcomes: ["Formulate problems as MDPs.", "Implement tabular and deep RL agents.", "Design reward functions that do not backfire."],
    prerequisites: ["Deep Learning in Practice"],
    instructorKey: "omar",
    modules: [
      { title: "Markov decision processes", lessons: [
        { title: "States, actions, rewards", type: "ARTICLE", durationMinutes: 15, content: `## States, actions, rewards\n\nDraft — outline only. The MDP formalism, the Bellman equation, and why discounting is a modelling choice.` },
        { title: "Lab · Value iteration on a grid world", type: "LAB", durationMinutes: 30, content: `## Lab · Value iteration\n\nDraft brief.`, lab: { language: "python", starterCode: `def value_iteration(states, actions, transition, reward, gamma=0.9, iters=100):\n    raise NotImplementedError\n`, tests: [ { name: "returns a dict of values", code: "v = value_iteration(['a'], ['stay'], lambda s,a: s, lambda s,a: 1)\nassert isinstance(v, dict)" } ] } },
      ] },
    ],
  },
];
