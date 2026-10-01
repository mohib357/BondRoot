package com.svnstartech.bondroot.ui;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.card.MaterialCardView;
import com.svnstartech.bondroot.R;
import com.svnstartech.bondroot.engine.RelationshipGraphEngine;
import com.svnstartech.bondroot.model.Person;
import com.svnstartech.bondroot.repository.PersonRepository;
import com.svnstartech.bondroot.util.LanguageManager;

import java.util.ArrayList;
import java.util.List;

public class FindRelationshipActivity extends AppCompatActivity {

    private Spinner spinnerPersonA, spinnerPersonB;
    private MaterialButton btnCalculate, btnViewInTree;
    private MaterialCardView cardResult;
    private TextView tvRelationshipTitleBangla, tvRelationshipTitleEnglish, tvPathDetailed;
    private TextView tvGenDiff, tvGraphDistance, tvCommonAncestor;

    private PersonRepository repository;
    private RelationshipGraphEngine graphEngine;
    private List<Person> allPersons;
    private RelationshipGraphEngine.RelationshipResult latestResult;

    @Override
    protected void attachBaseContext(Context newBase) {
        super.attachBaseContext(LanguageManager.applyLocale(newBase));
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_find_relationship);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle(getString(R.string.title_find_relationship));
            toolbar.setNavigationOnClickListener(v -> finish());
        }

        spinnerPersonA = findViewById(R.id.spinnerPersonA);
        spinnerPersonB = findViewById(R.id.spinnerPersonB);
        btnCalculate = findViewById(R.id.btnCalculate);
        cardResult = findViewById(R.id.cardResult);
        tvRelationshipTitleBangla = findViewById(R.id.tvRelationshipTitleBangla);
        tvRelationshipTitleEnglish = findViewById(R.id.tvRelationshipTitleEnglish);
        tvPathDetailed = findViewById(R.id.tvPathDetailed);

        tvGenDiff = findViewById(R.id.tvGenDiff);
        tvGraphDistance = findViewById(R.id.tvGraphDistance);
        tvCommonAncestor = findViewById(R.id.tvCommonAncestor);
        btnViewInTree = findViewById(R.id.btnViewInTree);

        btnCalculate.setText(getString(R.string.btn_calculate_relationship));

        repository = PersonRepository.getInstance(this);
        allPersons = repository.getAllPersons();
        graphEngine = new RelationshipGraphEngine(allPersons);

        setupSpinners();

        btnCalculate.setOnClickListener(v -> performCalculation());

        btnViewInTree.setOnClickListener(v -> {
            if (latestResult != null && !latestResult.pathSteps.isEmpty()) {
                ArrayList<String> highlightIds = new ArrayList<>();
                highlightIds.add(latestResult.personA.getPersonId());
                for (RelationshipGraphEngine.TraversalStep step : latestResult.pathSteps) {
                    highlightIds.add(step.toPerson.getPersonId());
                }
                Intent intent = new Intent(FindRelationshipActivity.this, FamilyTreeActivity.class);
                intent.putStringArrayListExtra("highlight_ids", highlightIds);
                startActivity(intent);
            }
        });

        String targetA = getIntent().getStringExtra("personA_id");
        String targetB = getIntent().getStringExtra("personB_id");
        if (targetA != null && targetB != null) {
            selectPersonInSpinner(spinnerPersonA, targetA);
            selectPersonInSpinner(spinnerPersonB, targetB);
            performCalculation();
        } else {
            selectPersonInSpinner(spinnerPersonA, "P100005");
            selectPersonInSpinner(spinnerPersonB, "P100006");
            performCalculation();
        }
    }

    private void setupSpinners() {
        boolean isEnglish = LanguageManager.isEnglish(this);
        List<String> names = new ArrayList<>();
        for (Person p : allPersons) {
            names.add(p.getDisplayName(isEnglish) + " [" + p.getPersonId() + "]");
        }

        ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, names);
        spinnerPersonA.setAdapter(adapter);
        spinnerPersonB.setAdapter(adapter);
    }

    private void selectPersonInSpinner(Spinner spinner, String personId) {
        for (int i = 0; i < allPersons.size(); i++) {
            if (allPersons.get(i).getPersonId().equals(personId)) {
                spinner.setSelection(i);
                break;
            }
        }
    }

    private void performCalculation() {
        int posA = spinnerPersonA.getSelectedItemPosition();
        int posB = spinnerPersonB.getSelectedItemPosition();

        if (posA < 0 || posB < 0 || posA >= allPersons.size() || posB >= allPersons.size()) {
            Toast.makeText(this, getString(R.string.select_both_persons_toast), Toast.LENGTH_SHORT).show();
            return;
        }

        Person pA = allPersons.get(posA);
        Person pB = allPersons.get(posB);

        RelationshipGraphEngine.RelationshipResult result = graphEngine.calculateRelationship(pA.getPersonId(), pB.getPersonId());
        if (result == null) {
            Toast.makeText(this, getString(R.string.relationship_not_found), Toast.LENGTH_SHORT).show();
            return;
        }

        latestResult = result;
        cardResult.setVisibility(View.VISIBLE);
        boolean isEnglish = LanguageManager.isEnglish(this);

        if (isEnglish) {
            tvRelationshipTitleBangla.setText(result.titleEnglish);
            tvRelationshipTitleEnglish.setText(result.titleBangla);
        } else {
            tvRelationshipTitleBangla.setText(result.titleBangla);
            tvRelationshipTitleEnglish.setText(result.titleEnglish);
        }

        // Metrics: Generation difference, graph distance, common ancestor
        String genStr = (result.generationLevel == 0) ?
                (isEnglish ? "0 (Same generation / Peer)" : "০ (সমসাময়িক প্রজন্ম)") :
                ((result.generationLevel > 0 ? "+" : "") + result.generationLevel + (isEnglish ? " generation(s)" : " প্রজন্ম"));
        tvGenDiff.setText((isEnglish ? "Generation Difference: " : "প্রজন্ম পার্থক্য: ") + genStr);

        tvGraphDistance.setText((isEnglish ? "Graph Distance: " : "গ্রাফ দূরত্ব: ") +
                result.graphDistance + (isEnglish ? " hops" : " ধাপ (এজ)"));

        if (result.commonAncestor != null) {
            tvCommonAncestor.setText((isEnglish ? "Common Ancestor: " : "কমন পূর্বপুরুষ: ") +
                    result.commonAncestor.getDisplayName(isEnglish) + " [" + result.commonAncestor.getPersonId() + "]");
        } else {
            tvCommonAncestor.setText((isEnglish ? "Common Ancestor: " : "কমন পূর্বপুরুষ: ") +
                    (isEnglish ? "Direct lineage connection" : "সরাসরি রক্তসম্পর্কিত বংশধারা"));
        }

        if (result.pathSteps.isEmpty()) {
            tvPathDetailed.setText(isEnglish ? result.titleEnglish : result.titleBangla);
        } else {
            StringBuilder pathBuilder = new StringBuilder();
            String startName = isEnglish ? pA.getNameEnglish() : pA.getNameLocal();
            if (startName == null || startName.isEmpty()) startName = pA.getDisplayName(isEnglish);
            pathBuilder.append(startName).append(isEnglish ? " (Start)" : " (শুরু)");

            for (RelationshipGraphEngine.TraversalStep step : result.pathSteps) {
                String rel = isEnglish ? step.relationEnglish : step.relationBangla;
                String targetName = isEnglish ? step.toPerson.getNameEnglish() : step.toPerson.getNameLocal();
                if (targetName == null || targetName.isEmpty()) targetName = step.toPerson.getDisplayName(isEnglish);

                pathBuilder.append("\n ➔ ")
                        .append(rel)
                        .append(": ")
                        .append(targetName)
                        .append(" [")
                        .append(step.toPerson.getPersonId())
                        .append("]");
            }
            tvPathDetailed.setText(pathBuilder.toString());
        }
    }
}
